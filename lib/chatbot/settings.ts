export type ChatbotOpenAiMode = 'always' | 'fallback' | 'off';

export type ChatbotSettings = {
  useOpenAI: boolean;
  openAiMode: ChatbotOpenAiMode;
  minConfidence: number;
  temperature: number;
  systemPromptLt: string;
  systemPromptEn: string;
};

export type ChatbotSettingsSource = 'supabase' | 'env';

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getEnvBool(name: string, defaultValue = false): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return defaultValue;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function getEnvMode(): ChatbotOpenAiMode {
  const raw = (process.env.CHATBOT_OPENAI_MODE || '').trim().toLowerCase();
  if (raw === 'off') return 'off';
  if (raw === 'fallback') return 'fallback';
  return 'always';
}

export function getDefaultChatbotSettings(): ChatbotSettings {
  const systemPromptLt =
    (process.env.CHATBOT_SYSTEM_PROMPT_LT || '').trim() ||
    'Tu esi Yakiwood pokalbiu asistentas. Atsakyk aiskiai ir trumpai. Jei truksta informacijos - uzduok 1-2 patikslinancius klausimus. Jei reikia individualaus pasiulymo, nukreipk i Kontaktus.';

  const systemPromptEn =
    (process.env.CHATBOT_SYSTEM_PROMPT_EN || '').trim() ||
    'You are a Yakiwood chat assistant. Answer clearly and concisely. If information is missing, ask 1-2 clarifying questions. For custom quotes, direct the user to Contact.';

  return {
    useOpenAI: getEnvBool('CHATBOT_USE_OPENAI', true),
    openAiMode: getEnvMode(),
    minConfidence: clampNumber(process.env.CHATBOT_OPENAI_MIN_CONFIDENCE, 0.75, 0, 1),
    temperature: clampNumber(process.env.CHATBOT_OPENAI_TEMPERATURE, 0.2, 0, 2),
    systemPromptLt,
    systemPromptEn,
  };
}

type Cache = { expiresAt: number; value: ChatbotSettings; source: ChatbotSettingsSource };

function getCache(): Cache | null {
  const g = globalThis as unknown as { __ywChatbotSettingsCache?: Cache };
  if (!g.__ywChatbotSettingsCache) return null;
  return g.__ywChatbotSettingsCache;
}

function setCache(cache: Cache) {
  const g = globalThis as unknown as { __ywChatbotSettingsCache?: Cache };
  g.__ywChatbotSettingsCache = cache;
}

export function clearChatbotSettingsCache() {
  const g = globalThis as unknown as { __ywChatbotSettingsCache?: Cache };
  delete g.__ywChatbotSettingsCache;
}

function normalizeMode(value: unknown): ChatbotOpenAiMode {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'off') return 'off';
  if (v === 'fallback') return 'fallback';
  return 'always';
}

export async function getChatbotSettings(): Promise<{ settings: ChatbotSettings; source: ChatbotSettingsSource }> {
  const now = Date.now();
  const cached = getCache();
  if (cached && cached.expiresAt > now) return { settings: cached.value, source: cached.source };

  const defaults = getDefaultChatbotSettings();

  try {
    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) {
      setCache({ expiresAt: now + 30_000, value: defaults, source: 'env' });
      return { settings: defaults, source: 'env' };
    }

    const { data, error } = await supabaseAdmin
      .from('chatbot_settings')
      .select('use_openai, openai_mode, min_confidence, temperature, system_prompt_lt, system_prompt_en')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      setCache({ expiresAt: now + 30_000, value: defaults, source: 'env' });
      return { settings: defaults, source: 'env' };
    }

    const merged: ChatbotSettings = {
      useOpenAI: typeof (data as any).use_openai === 'boolean' ? Boolean((data as any).use_openai) : defaults.useOpenAI,
      openAiMode: normalizeMode((data as any).openai_mode) ?? defaults.openAiMode,
      minConfidence: clampNumber((data as any).min_confidence, defaults.minConfidence, 0, 1),
      temperature: clampNumber((data as any).temperature, defaults.temperature, 0, 2),
      systemPromptLt: String(((data as any).system_prompt_lt ?? '') as string).trim() || defaults.systemPromptLt,
      systemPromptEn: String(((data as any).system_prompt_en ?? '') as string).trim() || defaults.systemPromptEn,
    };

    setCache({ expiresAt: now + 30_000, value: merged, source: 'supabase' });
    return { settings: merged, source: 'supabase' };
  } catch {
    setCache({ expiresAt: now + 30_000, value: defaults, source: 'env' });
    return { settings: defaults, source: 'env' };
  }
}
