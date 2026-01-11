import { NextResponse } from 'next/server';
import { z } from 'zod';
import { matchFaq } from '@/lib/chatbot/match';
import { getFaqEntries } from '@/lib/chatbot/faq';
import { appendEvent } from '@/lib/chatbot/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  sessionId: z.string().trim().min(8).max(200),
  message: z.string().trim().min(1).max(2000),
  page: z.string().trim().max(300).optional(),
  locale: z.enum(['lt', 'en']).optional(),
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
  const g = globalThis as unknown as { __chatbotRateLimit?: Map<string, RateLimitEntry> };
  if (!g.__chatbotRateLimit) g.__chatbotRateLimit = new Map();
  return g.__chatbotRateLimit;
}

function checkRateLimit(key: string, now: number) {
  // 30 requests / 5 minutes per IP+session
  const limit = 30;
  const windowMs = 5 * 60 * 1000;

  const store = getRateLimiterStore();
  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return {
      ok: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - entry.timestamps[0]!)) / 1000)),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { ok: true as const };
}

export async function POST(request: Request) {
  const now = Date.now();
  const ip = getClientIp(request);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const { sessionId, message, page, locale } = parsed.data;

  const rateKey = `${ip}:${sessionId}`;
  const rate = checkRateLimit(rateKey, now);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: 'Per daug užklausų. Pabandykite vėliau.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  await appendEvent({
    sessionId,
    role: 'user',
    message,
    meta: { page: page ?? null },
  });

  const entries = await getFaqEntries(locale);
  const { entry, confidence } = matchFaq(message, entries);

  await appendEvent({
    sessionId,
    role: 'assistant',
    message: entry.answer,
    meta: { faqId: entry.id, confidence },
  });

  return NextResponse.json({
    ok: true,
    data: {
      reply: entry.answer,
      faqId: entry.id,
      confidence,
      suggestions: entry.suggestions ?? [],
      handoff: { label: 'Kontaktai', href: '/kontaktai' },
    },
  });
}
