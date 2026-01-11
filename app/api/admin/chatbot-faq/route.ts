import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LocaleSchema = z.enum(['lt', 'en']);

const CreateSchema = z.object({
  locale: LocaleSchema.default('lt'),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  question: z.string().trim().min(3).max(200),
  answer: z.string().trim().min(3).max(4000),
  keywords: z.array(z.string().trim().min(1).max(80)).optional(),
  suggestions: z.array(z.string().trim().min(1).max(120)).optional(),
});

const UpdateSchema = z
  .object({
    id: z.string().trim().min(5).max(200),
    locale: LocaleSchema.optional(),
    enabled: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
    question: z.string().trim().min(3).max(200).optional(),
    answer: z.string().trim().min(3).max(4000).optional(),
    keywords: z.array(z.string().trim().min(1).max(80)).optional(),
    suggestions: z.array(z.string().trim().min(1).max(120)).optional(),
  })
  .refine((v) => {
    const { id, ...rest } = v
    void id
    return Object.keys(rest).length > 0;
  }, { message: 'Empty patch' });

type AdminFaqEntry = {
  id: string;
  locale: 'lt' | 'en';
  enabled: boolean;
  order: number;
  question: string;
  answer: string;
  keywords: string[];
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
};

async function safeJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const sp = request.nextUrl.searchParams
    const locale = sp.get('locale')
    const includeAllLocales = sp.get('allLocales') === '1'

    const parsedLocale = locale ? LocaleSchema.safeParse(locale) : null
    if (locale && !parsedLocale?.success) {
      return NextResponse.json({ success: false, error: 'Invalid locale' }, { status: 400 })
    }

    const { client } = await import('@/sanity/lib/client');

    const query = includeAllLocales
      ? `*[_type == "chatbotFaqEntry"] | order(locale asc, order asc, _createdAt asc) {
          "id": _id,
          locale,
          "enabled": coalesce(enabled, true),
          "order": coalesce(order, 100),
          question,
          answer,
          "keywords": coalesce(keywords, []),
          "suggestions": coalesce(suggestions, []),
          "createdAt": _createdAt,
          "updatedAt": _updatedAt
        }`
      : `*[_type == "chatbotFaqEntry" && locale == $locale] | order(order asc, _createdAt asc) {
          "id": _id,
          locale,
          "enabled": coalesce(enabled, true),
          "order": coalesce(order, 100),
          question,
          answer,
          "keywords": coalesce(keywords, []),
          "suggestions": coalesce(suggestions, []),
          "createdAt": _createdAt,
          "updatedAt": _updatedAt
        }`;

    const data = await client.fetch<AdminFaqEntry[]>(
      query,
      includeAllLocales ? {} : { locale: parsedLocale?.data ?? 'lt' }
    );

    return NextResponse.json({ success: true, data: Array.isArray(data) ? data : [] })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to load FAQ entries';
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const json = await safeJson(request)
    const parsed = CreateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    const { writeClient, assertWriteToken } = await import('@/sanity/lib/writeClient');
    assertWriteToken();

    const created = await writeClient.create({
      _type: 'chatbotFaqEntry',
      locale: parsed.data.locale,
      enabled: parsed.data.enabled ?? true,
      order: parsed.data.order ?? 100,
      question: parsed.data.question,
      answer: parsed.data.answer,
      keywords: parsed.data.keywords ?? [],
      suggestions: parsed.data.suggestions ?? [],
    });

    return NextResponse.json({ success: true, data: { id: created._id } }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to create FAQ entry';
    const status = message.includes('SANITY_API_TOKEN') ? 503 : 500;
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)

    const json = await safeJson(request)
    const parsed = UpdateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    const { writeClient, assertWriteToken } = await import('@/sanity/lib/writeClient');
    assertWriteToken();

    const { id, ...rest } = parsed.data;
    const patch: Record<string, unknown> = {};
    if (typeof rest.locale === 'string') patch.locale = rest.locale;
    if (typeof rest.enabled === 'boolean') patch.enabled = rest.enabled;
    if (typeof rest.order === 'number') patch.order = rest.order;
    if (typeof rest.question === 'string') patch.question = rest.question;
    if (typeof rest.answer === 'string') patch.answer = rest.answer;
    if (Array.isArray(rest.keywords)) patch.keywords = rest.keywords;
    if (Array.isArray(rest.suggestions)) patch.suggestions = rest.suggestions;

    await writeClient.patch(id).set(patch).commit();
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to update FAQ entry';
    const status = message.includes('SANITY_API_TOKEN') ? 503 : 500;
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request)

    const sp = request.nextUrl.searchParams
    const id = sp.get('id')
    const IdSchema = z.string().trim().min(5).max(200)
    const parsed = IdSchema.safeParse(id)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    const { writeClient, assertWriteToken } = await import('@/sanity/lib/writeClient');
    assertWriteToken();
    await writeClient.delete(parsed.data);
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to delete FAQ entry';
    const status = message.includes('SANITY_API_TOKEN') ? 503 : 500;
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
