import { NextResponse } from 'next/server';
import { z } from 'zod';
import { matchFaq, rankFaq } from '@/lib/chatbot/match';
import { getFaqEntries } from '@/lib/chatbot/faq';
import { appendEvent } from '@/lib/chatbot/storage';
import { getChatbotSettings } from '@/lib/chatbot/settings';
import {
  buildCatalogContextBlock,
  buildDeliveryContextBlock,
  buildDynamicSuggestions,
  getLiveCatalog,
  matchProductFromMessage,
  productPathForLocale,
  tryReplyWithLiveSiteData,
} from '@/lib/chatbot/site-context';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PayloadSchema = z.object({
  sessionId: z.string().trim().min(8).max(200),
  message: z.string().trim().min(1).max(2000),
  page: z.string().trim().max(300).optional(),
  locale: z.enum(['lt', 'en']).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().min(1).max(4000),
      })
    )
    .max(30)
    .optional(),
});

function buildFaqContextBlock(ranked: { entry: { question: string; answer: string } }[]): string {
  if (!ranked.length) return '';
  const lines: string[] = [];
  lines.push('Knowledge base context (use when relevant):');
  for (const r of ranked) {
    const q = String(r.entry.question || '').slice(0, 300);
    const a = String(r.entry.answer || '').slice(0, 900);
    if (!q || !a) continue;
    lines.push(`- Q: ${q}`);
    lines.push(`  A: ${a}`);
  }
  return lines.join('\n');
}

async function replyWithOpenAI(args: {
  locale: 'lt' | 'en';
  message: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  page: string | null;
  faqRanked: Array<{ entry: { question: string; answer: string } }>;
  catalogBlock: string;
  deliveryBlock: string;
  systemPrompt: string;
  model: string;
  temperature: number;
}): Promise<{ reply: string; model: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey });

  const model = args.model;
  const temperature = args.temperature;

  const systemPrompt = args.systemPrompt;
  const faqBlock = buildFaqContextBlock(args.faqRanked);
  const catalogBlock = args.catalogBlock;
  const deliveryBlock = args.deliveryBlock;
  const pageLine = args.page ? `Current page: ${args.page}` : '';

  const contactPath = args.locale === 'en' ? '/contact' : '/kontaktai';
  const system = [
    systemPrompt,
    'Rules:',
    '- Do not ask for or store sensitive personal data.',
    `- If unsure, suggest contacting us via ${contactPath}.`,
    deliveryBlock,
    catalogBlock,
    faqBlock,
    pageLine,
  ]
    .filter(Boolean)
    .join('\n\n');

  const history = (args.history || []).slice(-16);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: system },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: args.message },
  ];

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { reply, model };
  } catch {
    return null;
  }
}

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

function getRateLimitMessage(locale: 'lt' | 'en') {
  return locale === 'en' ? 'Too many requests. Please try again later.' : 'Per daug uzklausu. Pabandykite veliau.';
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
  const history = Array.isArray(parsed.data.history) ? parsed.data.history : [];
  const localeValue: 'lt' | 'en' = locale === 'en' ? 'en' : 'lt';

  const { settings } = await getChatbotSettings();

  // Live site context: products + delivery rules.
  // This ensures the bot stays up-to-date when catalog or prices change.
  let products: Awaited<ReturnType<typeof getLiveCatalog>> = [];
  try {
    products = await getLiveCatalog(localeValue);
  } catch {
    products = [];
  }
  const catalogBlock = buildCatalogContextBlock(products, localeValue);
  const deliveryBlock = buildDeliveryContextBlock(localeValue);
  const dynamicSuggestions = buildDynamicSuggestions(products, localeValue);

  const matchedProduct = matchProductFromMessage({
    locale: localeValue,
    message,
    products,
  });

  const rateKey = `${ip}:${sessionId}`;
  const rate = checkRateLimit(rateKey, now);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: getRateLimitMessage(localeValue) },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  await appendEvent({
    sessionId,
    role: 'user',
    message,
    meta: { page: page ?? null },
  });

  const entries = await getFaqEntries(localeValue);
  const ranked = rankFaq(message, entries, 3);
  const { entry, confidence } = matchFaq(message, entries);

  const apiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  const canUseOpenAi = apiKeyConfigured && settings.useOpenAI && settings.openAiMode !== 'off';
  const shouldUseOpenAi =
    canUseOpenAi && (settings.openAiMode === 'always' || confidence < settings.minConfidence);

  const openAiResult = shouldUseOpenAi
    ? await replyWithOpenAI({
        locale: localeValue,
        message,
        history,
        page: page ?? null,
        faqRanked: ranked,
        catalogBlock,
        deliveryBlock,
        systemPrompt: localeValue === 'en' ? settings.systemPromptEn : settings.systemPromptLt,
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        temperature: settings.temperature,
      })
    : null;

  const liveReply = tryReplyWithLiveSiteData({
    locale: localeValue,
    message,
    products,
  });

  const reply = openAiResult?.reply ?? liveReply ?? entry.answer;
  const handoff =
    localeValue === 'en'
      ? { label: 'Contact', href: '/contact' }
      : { label: 'Kontaktai', href: '/kontaktai' };

  await appendEvent({
    sessionId,
    role: 'assistant',
    message: reply,
    meta: {
      faqId: entry.id,
      confidence,
      openai: Boolean(openAiResult),
      openaiModel: openAiResult?.model ?? null,
      openaiMode: settings.openAiMode,
    },
  });

  const actions = matchedProduct
    ? (() => {
        const href = productPathForLocale(matchedProduct, localeValue);
        const slugForLocale =
          localeValue === 'en'
            ? (matchedProduct.slugEn ?? matchedProduct.slug)
            : matchedProduct.slug;
        const effectivePrice =
          typeof matchedProduct.salePrice === 'number' && matchedProduct.salePrice > 0
            ? matchedProduct.salePrice
            : matchedProduct.price;
        return [
          {
            type: 'add_to_cart',
            label: localeValue === 'en' ? 'Add to cart' : 'Į krepšelį',
            item: {
              id: matchedProduct.id,
              name: localeValue === 'en' ? (matchedProduct.nameEn ?? matchedProduct.name) : matchedProduct.name,
              slug: slugForLocale,
              basePrice: Number.isFinite(effectivePrice) ? effectivePrice : 0,
              quantity: 1,
            },
          },
          {
            type: 'open_product',
            label: localeValue === 'en' ? 'Open product' : 'Atidaryti prekę',
            href,
          },
        ];
      })()
    : [];

  return NextResponse.json({
    ok: true,
    data: {
      reply,
      faqId: entry.id,
      confidence,
      suggestions: Array.from(
        new Set([...(dynamicSuggestions ?? []), ...((entry.suggestions ?? []) as string[])])
      ).slice(0, 10),
      actions,
      handoff,
    },
  });
}
