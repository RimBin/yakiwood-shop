import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LocaleSchema = z.enum(['lt', 'en'])

function toDocId(locale: 'lt' | 'en', entryId: string) {
  const safe = String(entryId)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  return `chatbotFaqEntry_${locale}_${safe || 'entry'}`
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const sp = request.nextUrl.searchParams
    const localeParam = sp.get('locale')

    const localeParsed = localeParam ? LocaleSchema.safeParse(localeParam) : null
    if (localeParam && !localeParsed?.success) {
      return NextResponse.json({ success: false, error: 'Invalid locale' }, { status: 400 })
    }

    const { getStaticFaqEntries } = await import('@/lib/chatbot/faq')
    const { writeClient, assertWriteToken } = await import('@/sanity/lib/writeClient')

    assertWriteToken()

    const locales: Array<'lt' | 'en'> = localeParsed?.success ? [localeParsed.data] : ['lt', 'en']

    let importedCount = 0
    let tx = writeClient.transaction()

    for (const locale of locales) {
      const entries = getStaticFaqEntries(locale)

      entries.forEach((e, idx) => {
        const _id = toDocId(locale, e.id)

        tx = tx.createIfNotExists({
          _id,
          _type: 'chatbotFaqEntry',
          locale,
          enabled: true,
          order: idx * 10,
          question: String(e.question),
          answer: String(e.answer),
          keywords: Array.isArray(e.keywords) ? e.keywords.map(String) : [],
          suggestions: Array.isArray(e.suggestions) ? e.suggestions.map(String) : [],
        })

        importedCount += 1
      })
    }

    await tx.commit({ autoGenerateArrayKeys: true })

    return NextResponse.json({ success: true, data: { imported: importedCount } }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : 'Failed to import FAQ entries'
    const status = message.includes('SANITY_API_TOKEN') ? 503 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
