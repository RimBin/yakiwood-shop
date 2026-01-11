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
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 })
    }

    const localeValue = parsedLocale?.data ?? 'lt'

    const query = supabaseAdmin
      .from('chatbot_faq_entries')
      .select('id, locale, enabled, sort_order, question, answer, keywords, suggestions, created_at, updated_at')

    const { data, error } = includeAllLocales
      ? await query.order('locale', { ascending: true }).order('sort_order', { ascending: true })
      : await query.eq('locale', localeValue).order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped: AdminFaqEntry[] = (Array.isArray(data) ? data : []).map((row: any) => ({
      id: String(row.id),
      locale: (row.locale === 'en' ? 'en' : 'lt'),
      enabled: Boolean(row.enabled),
      order: Number.isFinite(row.sort_order) ? Number(row.sort_order) : 100,
      question: String(row.question ?? ''),
      answer: String(row.answer ?? ''),
      keywords: Array.isArray(row.keywords) ? row.keywords.map(String) : [],
      suggestions: Array.isArray(row.suggestions) ? row.suggestions.map(String) : [],
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    }))

    return NextResponse.json({ data: mapped })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to load FAQ entries';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const json = await safeJson(request)
    const parsed = CreateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 })
    }

    const { data, error } = await supabaseAdmin
      .from('chatbot_faq_entries')
      .insert({
        locale: parsed.data.locale,
        enabled: parsed.data.enabled ?? true,
        sort_order: parsed.data.order ?? 100,
        question: parsed.data.question,
        answer: parsed.data.answer,
        keywords: parsed.data.keywords ?? [],
        suggestions: parsed.data.suggestions ?? [],
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id: String((data as any)?.id) } }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to create FAQ entry';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)

    const json = await safeJson(request)
    const parsed = UpdateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { id, ...rest } = parsed.data;
    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 })
    }

    const patch: Record<string, unknown> = {};
    if (typeof rest.locale === 'string') patch.locale = rest.locale;
    if (typeof rest.enabled === 'boolean') patch.enabled = rest.enabled;
    if (typeof rest.order === 'number') patch.sort_order = rest.order;
    if (typeof rest.question === 'string') patch.question = rest.question;
    if (typeof rest.answer === 'string') patch.answer = rest.answer;
    if (Array.isArray(rest.keywords)) patch.keywords = rest.keywords;
    if (Array.isArray(rest.suggestions)) patch.suggestions = rest.suggestions;

    const { error } = await supabaseAdmin.from('chatbot_faq_entries').update(patch).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { ok: true } })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to update FAQ entry';
    return NextResponse.json({ error: message }, { status: 500 })
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
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 })
    }

    const { error } = await supabaseAdmin.from('chatbot_faq_entries').delete().eq('id', parsed.data);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { ok: true } })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to delete FAQ entry';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
