import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin';
import { clearChatbotSettingsCache, getChatbotSettings } from '@/lib/chatbot/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isMissingSupabaseTableError(message: string | null | undefined): boolean {
  const m = String(message || '').toLowerCase();
  return m.includes('could not find the table') || (m.includes('schema cache') && m.includes('table'));
}

const UpdateSchema = z.object({
  useOpenAI: z.boolean().optional(),
  openAiMode: z.enum(['always', 'fallback', 'off']).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPromptLt: z.string().trim().max(6000).optional(),
  systemPromptEn: z.string().trim().max(6000).optional(),
});

async function safeJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { settings, source } = await getChatbotSettings();
    return NextResponse.json({ ok: true, data: { ...settings, source } });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to load settings';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);

    const json = await safeJson(request);
    const parsed = UpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'ERR_SUPABASE_NOT_CONFIGURED' }, { status: 503 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof parsed.data.useOpenAI === 'boolean') patch.use_openai = parsed.data.useOpenAI;
    if (typeof parsed.data.openAiMode === 'string') patch.openai_mode = parsed.data.openAiMode;
    if (typeof parsed.data.minConfidence === 'number') patch.min_confidence = parsed.data.minConfidence;
    if (typeof parsed.data.temperature === 'number') patch.temperature = parsed.data.temperature;
    if (typeof parsed.data.systemPromptLt === 'string') patch.system_prompt_lt = parsed.data.systemPromptLt;
    if (typeof parsed.data.systemPromptEn === 'string') patch.system_prompt_en = parsed.data.systemPromptEn;

    const { error } = await supabaseAdmin
      .from('chatbot_settings')
      .upsert({ id: 'default', ...patch }, { onConflict: 'id' });

    if (error) {
      if (isMissingSupabaseTableError(error.message)) {
        return NextResponse.json({ ok: false, error: 'ERR_SUPABASE_MISSING_TABLE:chatbot_settings' }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    clearChatbotSettingsCache();
    return NextResponse.json({ ok: true, data: { ok: true } });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
