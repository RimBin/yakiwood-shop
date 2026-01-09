import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const ContactPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),

  recaptchaToken: z.string().trim().min(1),

  // Anti-spam signals
  company: z.string().optional().or(z.literal('')), // honeypot
  startedAt: z.number().int().optional(),
});

type RateLimitEntry = {
  timestamps: number[];
};

function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function getRateLimiterStore(): Map<string, RateLimitEntry> {
  const g = globalThis as unknown as { __contactRateLimit?: Map<string, RateLimitEntry> };
  if (!g.__contactRateLimit) g.__contactRateLimit = new Map();
  return g.__contactRateLimit;
}

function checkRateLimit(ip: string, now: number) {
  // 5 requests / 10 minutes per IP
  const limit = 5;
  const windowMs = 10 * 60 * 1000;

  const store = getRateLimiterStore();
  const entry = store.get(ip) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter(ts => now - ts < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(ip, entry);
    return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - entry.timestamps[0]!)) / 1000)) };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);
  return { ok: true as const };
}

export async function POST(request: Request) {
  const now = Date.now();
  const ip = getClientIp(request);

  const rate = checkRateLimit(ip, now);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ContactPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const { fullName, email, phone, company, startedAt, recaptchaToken } = parsed.data;

  // Honeypot: bots often fill hidden fields
  if (company && company.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Time-to-submit: very fast submissions are likely bots
  if (typeof startedAt === 'number') {
    const delta = now - startedAt;
    if (delta >= 0 && delta < 2500) {
      return NextResponse.json({ ok: false, error: 'Spam detected' }, { status: 400 });
    }
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken, ip);
  if (!recaptchaOk.ok) {
    return NextResponse.json({ ok: false, error: 'reCAPTCHA failed' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  const referer = request.headers.get('referer') ?? '';

  const to = process.env.CONTACT_TO_EMAIL || 'shop@yakiwood.co.uk';
  const subject = `New contact request - ${fullName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #161616;">New contact request</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666; width: 140px;">Name</td><td style="padding: 6px 0;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escapeHtml(phone || '')}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px; line-height: 1.4;">
        IP: ${escapeHtml(ip)}<br />
        User-Agent: ${escapeHtml(userAgent)}<br />
        Referer: ${escapeHtml(referer)}<br />
        Submitted: ${new Date(now).toISOString()}
      </p>
      <p style="color: #666; font-size: 12px;">Reply to the customer at: <a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a></p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject,
    html,
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error || 'Email failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function verifyRecaptcha(token: string, ip: string): Promise<{ ok: boolean }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    // Allow local development to proceed without secret, but enforce in production.
    if (process.env.NODE_ENV !== 'production') return { ok: true };
    return { ok: false };
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip && ip !== 'unknown') params.set('remoteip', ip);

  try {
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!resp.ok) return { ok: false };

    const data = (await resp.json()) as { success?: boolean };
    return { ok: data.success === true };
  } catch {
    return { ok: false };
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
