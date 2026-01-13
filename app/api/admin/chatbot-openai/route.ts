import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/supabase/admin'
import { getChatbotSettings } from '@/lib/chatbot/settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const configured = Boolean(process.env.OPENAI_API_KEY)
    const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'

    const { settings, source } = await getChatbotSettings()

    const promptLt = settings.systemPromptLt
    const promptEn = settings.systemPromptEn

    const preview = (value: string) => {
      const v = value.replace(/\s+/g, ' ').trim()
      if (!v) return null
      return v.length > 220 ? `${v.slice(0, 220)}…` : v
    }

    return NextResponse.json({
      ok: true,
      data: {
        configured,
        model,
        source,
        useOpenAI: settings.useOpenAI,
        openAiMode: settings.openAiMode,
        minConfidence: settings.minConfidence,
        temperature: settings.temperature,
        prompts: {
          lt: {
            isSet: Boolean(promptLt),
            preview: preview(promptLt),
          },
          en: {
            isSet: Boolean(promptEn),
            preview: preview(promptEn),
          },
        },
      },
    })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Failed to read OpenAI config'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
