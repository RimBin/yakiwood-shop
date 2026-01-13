import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getEnvBool(name: string, defaultValue = false): boolean {
  const v = (process.env[name] || '').trim().toLowerCase()
  if (!v) return defaultValue
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const configured = Boolean(process.env.OPENAI_API_KEY)
    const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'
    const useOpenAI = getEnvBool('CHATBOT_USE_OPENAI', true)

    const minConfidence = Number.isFinite(Number(process.env.CHATBOT_OPENAI_MIN_CONFIDENCE))
      ? Number(process.env.CHATBOT_OPENAI_MIN_CONFIDENCE)
      : 0.75

    const temperature = Number.isFinite(Number(process.env.CHATBOT_OPENAI_TEMPERATURE))
      ? Number(process.env.CHATBOT_OPENAI_TEMPERATURE)
      : 0.2

    const promptLt = (process.env.CHATBOT_SYSTEM_PROMPT_LT || '').trim()
    const promptEn = (process.env.CHATBOT_SYSTEM_PROMPT_EN || '').trim()

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
        useOpenAI,
        minConfidence,
        temperature,
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
