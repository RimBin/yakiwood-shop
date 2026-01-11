import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LocaleSchema = z.enum(['lt', 'en'])

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const sp = request.nextUrl.searchParams
    const localeParam = sp.get('locale')

    const localeParsed = localeParam ? LocaleSchema.safeParse(localeParam) : null
    if (localeParam && !localeParsed?.success) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const { getStaticFaqEntries } = await import('@/lib/chatbot/faq')
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 })
    }

    const locales: Array<'lt' | 'en'> = localeParsed?.success ? [localeParsed.data] : ['lt', 'en']

    const upsertRows: Array<{
      locale: 'lt' | 'en'
      source_key: string
      enabled: boolean
      sort_order: number
      question: string
      answer: string
      keywords: string[]
      suggestions: string[]
    }> = []

    for (const locale of locales) {
      const entries = getStaticFaqEntries(locale)
      entries.forEach((e, idx) => {
        upsertRows.push({
          locale,
          source_key: String(e.id),
          enabled: true,
          sort_order: idx * 10,
          question: String(e.question),
          answer: String(e.answer),
          keywords: Array.isArray(e.keywords) ? e.keywords.map(String) : [],
          suggestions: Array.isArray(e.suggestions) ? e.suggestions.map(String) : [],
        })
      })
    }

    const { data, error } = await supabaseAdmin
      .from('chatbot_faq_entries')
      .upsert(upsertRows, { onConflict: 'locale,source_key' })
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { imported: Array.isArray(data) ? data.length : upsertRows.length } }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to import FAQ entries'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
