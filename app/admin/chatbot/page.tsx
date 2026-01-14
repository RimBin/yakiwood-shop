'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { AdminBody, AdminButton, AdminInput, AdminSelect, AdminTextarea, AdminSubTabs } from '@/components/admin/ui/AdminUI';

type SessionSummary = {
  sessionId: string;
  createdAt: string;
  lastAt: string;
  eventCount: number;
  lastMessagePreview: string;
};

type ChatEvent = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  createdAt: string;
};

type Locale = 'lt' | 'en';

type FaqEntry = {
  id: string;
  locale: Locale;
  enabled: boolean;
  order: number;
  question: string;
  answer: string;
  keywords: string[];
  suggestions: string[];
  updatedAt?: string;
};

type FaqDraft = {
  id: string | null;
  locale: Locale;
  enabled: boolean;
  order: number;
  question: string;
  answer: string;
  keywordsText: string;
  suggestionsText: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

type OpenAiStatus = {
  configured: boolean;
  model: string;
  source: 'supabase' | 'env';
  useOpenAI: boolean;
  openAiMode: 'always' | 'fallback' | 'off';
  minConfidence: number;
  temperature: number;
  prompts: {
    lt: { isSet: boolean; preview: string | null };
    en: { isSet: boolean; preview: string | null };
  };
};

type ChatbotSettingsDto = {
  useOpenAI: boolean;
  openAiMode: 'always' | 'fallback' | 'off';
  minConfidence: number;
  temperature: number;
  systemPromptLt: string;
  systemPromptEn: string;
  source: 'supabase' | 'env';
};

type FineTuneStatus = {
  id: string;
  status: string;
  model: string;
  fineTunedModel: string | null;
  createdAt: number | null;
};

type MigrationSqlDto = {
  name: string;
  file?: string;
  sql: string;
};

async function getAdminToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinCommaList(value: string[] | undefined): string {
  return (value || []).join(', ');
}

async function safeJson<T>(resp: Response): Promise<ApiResponse<T>> {
  try {
    return (await resp.json()) as ApiResponse<T>;
  } catch {
    return { error: `ERR_PARSE_RESPONSE:${resp.status}` };
  }
}

function getErrorMessageKey(resp: Response, bodyError?: string) {
  if (bodyError) return bodyError;
  if (resp.ok) return null;
  return `ERR_REQUEST_FAILED:${resp.status}`;
}

function LocaleSelector({ value, onChange }: { value: Locale; onChange: (v: Locale) => void }) {
  return (
    <div className="flex gap-[8px]">
      <AdminButton size="sm" variant={value === 'lt' ? 'primary' : 'outline'} onClick={() => onChange('lt')}>
        LT
      </AdminButton>
      <AdminButton size="sm" variant={value === 'en' ? 'primary' : 'outline'} onClick={() => onChange('en')}>
        EN
      </AdminButton>
    </div>
  );
}

export default function AdminChatbotPage() {
  const t = useTranslations('adminChatbot');

  const fetchAdmin = useCallback(
    async (input: string, init?: RequestInit): Promise<Response> => {
      const token = await getAdminToken();
      if (!token) {
        return new Response(JSON.stringify({ error: t('errors.noAdminSession') }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      return fetch(input, { ...init, headers });
    },
    [t]
  );

  const translateApiError = useCallback((message: string | null): string | null => {
    if (!message) return null;

    if (message === 'ERR_SUPABASE_NOT_CONFIGURED') {
      return t('errors.supabaseNotConfigured');
    }

    if (message.startsWith('ERR_SUPABASE_MISSING_TABLE:')) {
      const table = message.split(':')[1] || 'unknown';
      return t('errors.supabaseMissingTable', { table });
    }

    if (message.startsWith('ERR_PARSE_RESPONSE:')) {
      const status = Number.parseInt(message.split(':')[1] || '0', 10);
      return t('errors.parseResponse', { status: Number.isFinite(status) ? status : 0 });
    }

    if (message.startsWith('ERR_REQUEST_FAILED:')) {
      const status = Number.parseInt(message.split(':')[1] || '0', 10);
      return t('errors.requestFailed', { status: Number.isFinite(status) ? status : 0 });
    }

    return message;
  }, [t]);

  const [tab, setTab] = useState<'sessions' | 'faq' | 'ai' | 'training'>('sessions');

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [faqLocale, setFaqLocale] = useState<Locale>('lt');
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([]);
  const [faqSelectedId, setFaqSelectedId] = useState<string | null>(null);
  const [faqDraft, setFaqDraft] = useState<FaqDraft>({
    id: null,
    locale: 'lt',
    enabled: true,
    order: 0,
    question: '',
    answer: '',
    keywordsText: '',
    suggestionsText: '',
  });
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqDeleting, setFaqDeleting] = useState(false);
  const [faqImporting, setFaqImporting] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [faqErrorCode, setFaqErrorCode] = useState<string | null>(null);
  const [faqNotice, setFaqNotice] = useState<string | null>(null);

  const [openAiStatus, setOpenAiStatus] = useState<OpenAiStatus | null>(null);
  const [openAiLoading, setOpenAiLoading] = useState(false);
  const [openAiError, setOpenAiError] = useState<string | null>(null);

  const [settings, setSettings] = useState<ChatbotSettingsDto | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<ChatbotSettingsDto | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsErrorCode, setSettingsErrorCode] = useState<string | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  const [dbHelpBusy, setDbHelpBusy] = useState(false);
  const [dbHelpNotice, setDbHelpNotice] = useState<string | null>(null);

  const [trainingLocale, setTrainingLocale] = useState<'lt' | 'en' | 'all'>('all');
  const [trainingBaseModel, setTrainingBaseModel] = useState<string>('gpt-4o-mini');
  const [fineTuneJobId, setFineTuneJobId] = useState<string>('');
  const [fineTuneStatus, setFineTuneStatus] = useState<FineTuneStatus | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStarting, setTrainingStarting] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const faqFetchedLocalesRef = useRef<Set<Locale>>(new Set());

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setSessionsError(null);
    try {
      const resp = await fetchAdmin('/api/admin/chatbot?action=sessions&limit=50');
      const json = await safeJson<SessionSummary[]>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setSessionsError(errorMsg);
        setSessions([]);
        return;
      }
      setSessions(json.data || []);
    } finally {
      setLoading(false);
    }
  }, [fetchAdmin, translateApiError]);

  const loadEvents = useCallback(
    async (sessionId: string) => {
    try {
      const resp = await fetchAdmin(
        `/api/admin/chatbot?action=events&sessionId=${encodeURIComponent(sessionId)}&limit=300`
      );
      const json = await safeJson<ChatEvent[]>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setEvents([
          {
            id: 'error',
            sessionId,
            role: 'system',
            message: errorMsg,
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      setEvents(json.data || []);
    } catch {
      setEvents([
        {
          id: 'error',
          sessionId,
          role: 'system',
          message: t('errors.loadEventsFailed'),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    },
    [fetchAdmin, t, translateApiError]
  );

  const loadFaqEntries = useCallback(
    async (locale: Locale) => {
      setFaqLoading(true);
      setFaqError(null);
      setFaqErrorCode(null);
      setFaqNotice(null);
      try {
        const resp = await fetchAdmin(`/api/admin/chatbot-faq?locale=${encodeURIComponent(locale)}`, {
          method: 'GET',
        });
        const json = await safeJson<FaqEntry[]>(resp);
        const rawError = getErrorMessageKey(resp, json.error);
        setFaqErrorCode(rawError);
        if (rawError?.startsWith('ERR_SUPABASE_MISSING_TABLE:')) {
          setFaqError(null);
          setFaqEntries([]);
          return;
        }
        const errorMsg = translateApiError(rawError);
        if (errorMsg) {
          setFaqError(errorMsg);
          setFaqEntries([]);
          return;
        }
        setFaqErrorCode(null);
        setFaqEntries((json.data || []).slice().sort((a, b) => a.order - b.order));
      } catch {
        setFaqError(t('errors.loadFaqFailed'));
        setFaqErrorCode('ERR_CLIENT_EXCEPTION');
        setFaqEntries([]);
      } finally {
        faqFetchedLocalesRef.current.add(locale);
        setFaqLoading(false);
      }
    },
    [fetchAdmin, t, translateApiError]
  );

  const loadOpenAiStatus = useCallback(async () => {
    setOpenAiLoading(true);
    setOpenAiError(null);
    try {
      const resp = await fetchAdmin('/api/admin/chatbot-openai', { method: 'GET' });
      const json = await safeJson<OpenAiStatus>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setOpenAiError(errorMsg);
        setOpenAiStatus(null);
        return;
      }
      setOpenAiStatus(json.data ?? null);
    } catch {
      setOpenAiError(t('errors.requestFailed', { status: 0 }));
      setOpenAiStatus(null);
    } finally {
      setOpenAiLoading(false);
    }
  }, [fetchAdmin, t, translateApiError]);

  const loadChatbotSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsErrorCode(null);
    setSettingsNotice(null);
    try {
      const resp = await fetchAdmin('/api/admin/chatbot-settings', { method: 'GET' });
      const json = await safeJson<ChatbotSettingsDto>(resp);
      const rawError = getErrorMessageKey(resp, (json as any).error);
      setSettingsErrorCode(rawError);
      if (rawError?.startsWith('ERR_SUPABASE_MISSING_TABLE:')) {
        setSettingsError(null);
        setSettings(null);
        setSettingsDraft(null);
        return;
      }
      const errorMsg = translateApiError(rawError);
      if (errorMsg) {
        setSettingsError(errorMsg);
        setSettings(null);
        setSettingsDraft(null);
        return;
      }
      const dto = (json as any).data as ChatbotSettingsDto | undefined;
      if (!dto) {
        setSettings(null);
        setSettingsDraft(null);
        return;
      }
      setSettingsErrorCode(null);
      setSettings(dto);
      setSettingsDraft(dto);
    } catch {
      setSettingsError(t('errors.requestFailed', { status: 0 }));
      setSettingsErrorCode('ERR_CLIENT_EXCEPTION');
    } finally {
      setSettingsLoading(false);
    }
  }, [fetchAdmin, t, translateApiError]);

  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'true');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      ta.remove();
    }
  }, []);

  const copyMigrationSql = useCallback(
    async (name: 'chatbot_faq_entries' | 'chatbot_settings' | 'reload-schema') => {
      setDbHelpBusy(true);
      setDbHelpNotice(null);
      try {
        const resp = await fetchAdmin(`/api/admin/chatbot-migrations?name=${encodeURIComponent(name)}`, {
          method: 'GET',
        });
        const json = await safeJson<MigrationSqlDto>(resp);
        const errorMsg = translateApiError(getErrorMessageKey(resp, (json as any).error));
        if (errorMsg) {
          setDbHelpNotice(t('dbSetup.copyFailed'));
          return;
        }
        const sql = (json as any).data?.sql as string | undefined;
        if (!sql) {
          setDbHelpNotice(t('dbSetup.copyFailed'));
          return;
        }
        await copyToClipboard(sql);
        setDbHelpNotice(t('dbSetup.copied'));
      } catch {
        setDbHelpNotice(t('dbSetup.copyFailed'));
      } finally {
        setDbHelpBusy(false);
      }
    },
    [copyToClipboard, fetchAdmin, t, translateApiError]
  );

  const saveChatbotSettings = useCallback(async () => {
    if (!settingsDraft) return;
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsNotice(null);
    try {
      const resp = await fetchAdmin('/api/admin/chatbot-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useOpenAI: settingsDraft.useOpenAI,
          openAiMode: settingsDraft.openAiMode,
          minConfidence: settingsDraft.minConfidence,
          temperature: settingsDraft.temperature,
          systemPromptLt: settingsDraft.systemPromptLt,
          systemPromptEn: settingsDraft.systemPromptEn,
        }),
      });

      const json = await safeJson<{ ok: true }>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, (json as any).error));
      if (errorMsg) {
        setSettingsError(errorMsg);
        return;
      }

      setSettingsNotice(t('ai.noticeSaved'));
      await Promise.all([loadOpenAiStatus(), loadChatbotSettings()]);
    } catch {
      setSettingsError(t('errors.saveFailed'));
    } finally {
      setSettingsSaving(false);
    }
  }, [loadChatbotSettings, loadOpenAiStatus, settingsDraft, t, translateApiError, fetchAdmin]);

  const downloadTrainingData = useCallback(async () => {
    setTrainingLoading(true);
    setTrainingError(null);
    try {
      const resp = await fetchAdmin(
        `/api/admin/chatbot-training?action=export&locale=${encodeURIComponent(trainingLocale)}`,
        { method: 'GET' }
      );
      if (!resp.ok) {
        const json = await safeJson<{ error?: string }>(resp);
        const errorMsg = translateApiError(getErrorMessageKey(resp, (json as any).error));
        setTrainingError(errorMsg || t('errors.requestFailed', { status: resp.status }));
        return;
      }
      const text = await resp.text();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `yakiwood-chatbot-training-${trainingLocale}.jsonl`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setTrainingError(t('errors.requestFailed', { status: 0 }));
    } finally {
      setTrainingLoading(false);
    }
  }, [fetchAdmin, t, trainingLocale, translateApiError]);

  const refreshFineTuneStatus = useCallback(
    async (jobId: string) => {
      if (!jobId) return;
      setTrainingLoading(true);
      setTrainingError(null);
      try {
        const resp = await fetchAdmin(
          `/api/admin/chatbot-training?action=status&jobId=${encodeURIComponent(jobId)}`,
          { method: 'GET' }
        );
        const json = await safeJson<FineTuneStatus>(resp);
        const errorMsg = translateApiError(getErrorMessageKey(resp, (json as any).error));
        if (errorMsg) {
          setTrainingError(errorMsg);
          return;
        }
        setFineTuneStatus((json as any).data ?? null);
      } catch {
        setTrainingError(t('errors.requestFailed', { status: 0 }));
      } finally {
        setTrainingLoading(false);
      }
    },
    [fetchAdmin, t, translateApiError]
  );

  const startFineTune = useCallback(async () => {
    setTrainingStarting(true);
    setTrainingError(null);
    try {
      const resp = await fetchAdmin('/api/admin/chatbot-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: trainingLocale, baseModel: trainingBaseModel }),
      });
      const json = await safeJson<{ jobId: string; status: string }>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, (json as any).error));
      if (errorMsg) {
        setTrainingError(errorMsg);
        return;
      }

      const jobId = (json as any).data?.jobId as string | undefined;
      if (jobId) {
        setFineTuneJobId(jobId);
        try {
          window.localStorage.setItem('yakiwood_chatbot_finetune_job', jobId);
        } catch {
          // ignore
        }
        await refreshFineTuneStatus(jobId);
      }
    } catch {
      setTrainingError(t('errors.requestFailed', { status: 0 }));
    } finally {
      setTrainingStarting(false);
    }
  }, [fetchAdmin, refreshFineTuneStatus, t, trainingBaseModel, trainingLocale, translateApiError]);

  const setDraftFromEntry = useCallback((entry: FaqEntry) => {
    setFaqDraft({
      id: entry.id,
      locale: entry.locale,
      enabled: entry.enabled,
      order: entry.order,
      question: entry.question,
      answer: entry.answer,
      keywordsText: joinCommaList(entry.keywords),
      suggestionsText: joinCommaList(entry.suggestions),
    });
  }, []);

  const newFaqDraft = useCallback((locale: Locale) => {
    setFaqSelectedId(null);
    setFaqDraft({
      id: null,
      locale,
      enabled: true,
      order: 0,
      question: '',
      answer: '',
      keywordsText: '',
      suggestionsText: '',
    });
    setFaqError(null);
    setFaqNotice(null);
  }, []);

  async function importDefaultFaq(locale: Locale) {
    setFaqImporting(true);
    setFaqError(null);
    setFaqNotice(null);

    try {
      const resp = await fetchAdmin(
        `/api/admin/chatbot-faq/import-defaults?locale=${encodeURIComponent(locale)}`,
        { method: 'POST' }
      );
      const json = await safeJson<{ imported: number }>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setFaqError(errorMsg);
        return;
      }

      setFaqNotice(t('faq.noticeImported', { count: json.data?.imported ?? 0 }));
      await loadFaqEntries(locale);
    } catch {
      setFaqError(t('errors.importFailed'));
    } finally {
      setFaqImporting(false);
    }
  }

  async function saveFaq() {
    setFaqSaving(true);
    setFaqError(null);
    setFaqNotice(null);

    const payload = {
      id: faqDraft.id,
      locale: faqDraft.locale,
      enabled: faqDraft.enabled,
      order: Number.isFinite(faqDraft.order) ? faqDraft.order : 0,
      question: faqDraft.question.trim(),
      answer: faqDraft.answer.trim(),
      keywords: splitCommaList(faqDraft.keywordsText),
      suggestions: splitCommaList(faqDraft.suggestionsText),
    };

    if (!payload.question) {
      setFaqSaving(false);
      setFaqError(t('errors.questionRequired'));
      return;
    }
    if (!payload.answer) {
      setFaqSaving(false);
      setFaqError(t('errors.answerRequired'));
      return;
    }

    try {
      const isUpdate = Boolean(faqDraft.id);
      const resp = await fetchAdmin('/api/admin/chatbot-faq', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await safeJson<{ id: string }>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setFaqError(errorMsg);
        return;
      }

      setFaqNotice(isUpdate ? t('faq.noticeSaved') : t('faq.noticeCreated'));
      await loadFaqEntries(faqLocale);

      if (!isUpdate && json.data?.id) {
        setFaqSelectedId(json.data.id);
      }
    } catch {
      setFaqError(t('errors.saveFailed'));
    } finally {
      setFaqSaving(false);
    }
  }

  async function deleteFaq() {
    if (!faqDraft.id) return;
    setFaqDeleting(true);
    setFaqError(null);
    setFaqNotice(null);

    try {
      const resp = await fetchAdmin(`/api/admin/chatbot-faq?id=${encodeURIComponent(faqDraft.id)}`, {
        method: 'DELETE',
      });
      const json = await safeJson<{ ok: boolean }>(resp);
      const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
      if (errorMsg) {
        setFaqError(errorMsg);
        return;
      }
      setFaqNotice(t('faq.noticeDeleted'));
      await loadFaqEntries(faqLocale);
      newFaqDraft(faqLocale);
    } catch {
      setFaqError(t('errors.deleteFailed'));
    } finally {
      setFaqDeleting(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (selected) void loadEvents(selected);
  }, [loadEvents, selected]);

  useEffect(() => {
    setFaqSelectedId(null);
    newFaqDraft(faqLocale);
    setFaqEntries([]);
    setFaqError(null);
    setFaqNotice(null);
    setFaqLoading(false);
  }, [faqLocale, newFaqDraft]);

  useEffect(() => {
    if (tab !== 'faq') return;
    if (faqFetchedLocalesRef.current.has(faqLocale)) return;
    void loadFaqEntries(faqLocale);
  }, [faqLocale, loadFaqEntries, tab]);

  useEffect(() => {
    if (tab !== 'ai') return;
    void loadOpenAiStatus();
    void loadChatbotSettings();
  }, [loadChatbotSettings, loadOpenAiStatus, tab]);

  useEffect(() => {
    if (tab !== 'training') return;
    try {
      const stored = window.localStorage.getItem('yakiwood_chatbot_finetune_job') || '';
      if (stored && !fineTuneJobId) setFineTuneJobId(stored);
    } catch {
      // ignore
    }
  }, [fineTuneJobId, tab]);

  useEffect(() => {
    if (tab !== 'training') return;
    if (!fineTuneJobId) return;
    void refreshFineTuneStatus(fineTuneJobId);
  }, [fineTuneJobId, refreshFineTuneStatus, tab]);

  useEffect(() => {
    if (!faqSelectedId) return;
    const entry = faqEntries.find((e) => e.id === faqSelectedId);
    if (entry) setDraftFromEntry(entry);
  }, [faqEntries, faqSelectedId, setDraftFromEntry]);

  const isFaqTableMissing = faqErrorCode === 'ERR_SUPABASE_MISSING_TABLE:chatbot_faq_entries';
  const isSettingsTableMissing = settingsErrorCode === 'ERR_SUPABASE_MISSING_TABLE:chatbot_settings';

  const panelClass = 'rounded-[24px] border border-[#E1E1E1] bg-[#EAEAEA] p-[clamp(20px,3vw,32px)]';

  const roleLabel = (role: ChatEvent['role']) => {
    if (role === 'user') return t('roles.user');
    if (role === 'assistant') return t('roles.assistant');
    return t('roles.system');
  };

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <div className="py-[24px] md:py-[40px]">
          <AdminSubTabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'sessions', label: t('tabs.sessions') },
              { value: 'faq', label: t('tabs.faq') },
              { value: 'ai', label: t('tabs.ai') },
              { value: 'training', label: t('tabs.training') },
            ]}
          />

          {tab === 'sessions' ? (
            <div className="mt-[16px] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
              <div className={panelClass}>
                <div className="flex items-center justify-between">
                  <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('sessions.title')}</h2>
                  <AdminButton size="sm" variant="outline" onClick={() => void loadSessions()}>
                    {t('common.refresh')}
                  </AdminButton>
                </div>

                {sessionsError ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-red-600">{sessionsError}</p>
                ) : loading ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('common.loading')}</p>
                ) : sessions.length === 0 ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('sessions.empty')}</p>
                ) : (
                  <div className="mt-[12px] space-y-[10px]">
                    {sessions.map((s) => (
                      <button
                        key={s.sessionId}
                        onClick={() => setSelected(s.sessionId)}
                        className={
                          'w-full text-left rounded-[16px] border px-[12px] py-[10px] ' +
                          (selected === s.sessionId
                            ? 'border-[#161616] bg-[#E1E1E1]'
                            : 'border-[#E1E1E1] bg-[#EAEAEA] hover:bg-[#E1E1E1]')
                        }
                      >
                        <div className="font-['DM_Sans'] text-[12px] text-[#161616]">
                          {s.sessionId.slice(0, 8)} {t('sessions.eventsCount', { count: s.eventCount })}
                        </div>
                        <div className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">
                          {s.lastMessagePreview || ''}
                        </div>
                        <div className="font-['Outfit'] text-[11px] text-[#888] mt-[6px]">
                          {new Date(s.lastAt).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={panelClass}>
                <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">
                  {t('sessions.conversationTitle')}
                </h2>
                {!selected ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('sessions.pickSession')}</p>
                ) : (
                  <div className="mt-[12px] space-y-[10px]">
                    {events.map((e) => (
                      <div key={e.id} className={e.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                          className={
                            e.role === 'user'
                              ? 'max-w-[85%] rounded-[16px] bg-[#161616] text-white px-[12px] py-[10px]'
                              : 'max-w-[85%] rounded-[16px] bg-[#E1E1E1] text-[#161616] px-[12px] py-[10px]'
                          }
                        >
                          <div className="font-['Outfit'] text-[11px] opacity-70 mb-[4px]">
                            {roleLabel(e.role)} {new Date(e.createdAt).toLocaleString()}
                          </div>
                          <div className="font-['Outfit'] text-[13px] leading-[1.4] whitespace-pre-line">
                            {e.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : tab === 'faq' ? (
            <div className="mt-[16px] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
              <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-[10px]">
                  <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('faq.title')}</h2>
                  <div className="flex items-center gap-[10px]">
                    <LocaleSelector value={faqLocale} onChange={setFaqLocale} />
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => void loadFaqEntries(faqLocale)}
                      disabled={faqLoading || isFaqTableMissing}
                    >
                      {t('common.refresh')}
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => newFaqDraft(faqLocale)}
                      disabled={isFaqTableMissing}
                    >
                      {t('common.new')}
                    </AdminButton>
                  </div>
                </div>

                {faqErrorCode?.startsWith('ERR_SUPABASE_MISSING_TABLE:') ? (
                  <div className="mt-[12px] rounded-[16px] border border-[#BBBBBB] bg-[#E1E1E1] p-[12px]">
                    <div className="font-['DM_Sans'] text-[13px] font-medium text-[#161616]">{t('dbSetup.title')}</div>
                    <div className="mt-[6px] font-['Outfit'] text-[12px] text-[#535353]">{t('dbSetup.subtitle')}</div>
                    <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void copyMigrationSql('chatbot_faq_entries')}
                        disabled={dbHelpBusy}
                      >
                        {t('dbSetup.copyFaq')}
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void copyMigrationSql('chatbot_settings')}
                        disabled={dbHelpBusy}
                      >
                        {t('dbSetup.copySettings')}
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void copyMigrationSql('reload-schema')}
                        disabled={dbHelpBusy}
                      >
                        {t('dbSetup.copyReload')}
                      </AdminButton>
                    </div>
                    {dbHelpNotice ? (
                      <div className="mt-[8px] font-['Outfit'] text-[12px] text-[#161616]">{dbHelpNotice}</div>
                    ) : null}
                  </div>
                ) : null}

                {faqError ? <p className="mt-[12px] font-['Outfit'] text-[13px] text-red-600">{faqError}</p> : null}

                {faqLoading ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('common.loading')}</p>
                ) : faqEntries.length === 0 ? (
                  <div className="mt-[12px]">
                    <p className="font-['Outfit'] text-[13px] text-[#535353]">{t('faq.empty')}</p>
                    <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                      <AdminButton
                        size="sm"
                        variant="primary"
                        onClick={() => void importDefaultFaq(faqLocale)}
                        disabled={faqImporting || faqLoading || isFaqTableMissing}
                      >
                        {faqImporting ? t('faq.importing') : t('faq.importDefaults')}
                      </AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-[12px] space-y-[10px]">
                    {faqEntries.map((e) => {
                      const active = faqSelectedId === e.id;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setFaqSelectedId(e.id)}
                          className={
                            'w-full text-left rounded-[16px] border px-[12px] py-[10px] ' +
                            (active
                              ? 'border-[#161616] bg-[#E1E1E1]'
                              : 'border-[#E1E1E1] bg-[#EAEAEA] hover:bg-[#E1E1E1]')
                          }
                        >
                          <div className="flex items-center justify-between gap-[10px]">
                            <div className="font-['DM_Sans'] text-[12px] text-[#161616]">
                              #{e.order} {e.enabled ? t('faq.statusEnabled') : t('faq.statusDisabled')}
                            </div>
                            <div className="font-['Outfit'] text-[11px] text-[#888]">{e.locale.toUpperCase()}</div>
                          </div>
                          <div className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">{e.question || ''}</div>
                          {e.updatedAt ? (
                            <div className="font-['Outfit'] text-[11px] text-[#888] mt-[6px]">
                              {new Date(e.updatedAt).toLocaleString()}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-[10px]">
                  <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('faq.editTitle')}</h2>
                  <div className="flex items-center gap-[10px]">
                    <AdminButton
                      size="sm"
                      variant="primary"
                      onClick={() => void saveFaq()}
                      disabled={faqSaving || faqDeleting || isFaqTableMissing}
                    >
                      {faqSaving ? t('common.saving') : t('common.save')}
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="danger"
                      onClick={() => void deleteFaq()}
                      disabled={!faqDraft.id || faqDeleting || faqSaving || isFaqTableMissing}
                    >
                      {faqDeleting ? t('common.deleting') : t('common.delete')}
                    </AdminButton>
                  </div>
                </div>

                {faqNotice ? (
                  <p className="mt-[10px] font-['Outfit'] text-[13px] text-[#161616]">{faqNotice}</p>
                ) : null}
                {faqError ? <p className="mt-[10px] font-['Outfit'] text-[13px] text-red-600">{faqError}</p> : null}

                <form
                  className="mt-[12px] grid grid-cols-1 gap-[12px]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveFaq();
                  }}
                >
                  <div className="flex flex-wrap items-center gap-[14px]">
                    <label className="flex items-center gap-[10px]">
                      <input
                        type="checkbox"
                        checked={faqDraft.enabled}
                        onChange={(e) => setFaqDraft((d) => ({ ...d, enabled: e.target.checked }))}
                        className="h-[16px] w-[16px] accent-[#161616]"
                      />
                      <span className="font-['Outfit'] text-[13px] text-[#161616]">{t('form.enabled')}</span>
                    </label>

                    <div className="flex items-center gap-[10px]">
                      <label className="font-['Outfit'] text-[13px] text-[#161616]">{t('form.order')}</label>
                      <AdminInput
                        type="number"
                        value={faqDraft.order}
                        onChange={(e) =>
                          setFaqDraft((d) => ({ ...d, order: Number.parseInt(e.target.value || '0', 10) }))
                        }
                        className="w-[120px] h-[40px]"
                      />
                    </div>

                    <div className="flex items-center gap-[10px]">
                      <span className="font-['Outfit'] text-[13px] text-[#161616]">{t('form.locale')}</span>
                      <LocaleSelector
                        value={faqDraft.locale}
                        onChange={(v) => {
                          setFaqDraft((d) => ({ ...d, locale: v }));
                          setFaqLocale(v);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">
                      {t('form.question')}
                    </label>
                    <AdminInput
                      type="text"
                      value={faqDraft.question}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, question: e.target.value }))}
                      placeholder={t('form.placeholders.question')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.answer')}</label>
                    <AdminTextarea
                      value={faqDraft.answer}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, answer: e.target.value }))}
                      className="min-h-[180px]"
                      placeholder={t('form.placeholders.answer')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.keywords')}</label>
                    <AdminInput
                      type="text"
                      value={faqDraft.keywordsText}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, keywordsText: e.target.value }))}
                      placeholder={t('form.placeholders.keywords')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.suggestions')}</label>
                    <AdminInput
                      type="text"
                      value={faqDraft.suggestionsText}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, suggestionsText: e.target.value }))}
                      placeholder={t('form.placeholders.suggestions')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-['Outfit'] text-[12px] text-[#535353]">
                      {faqDraft.id ? t('form.id', { id: faqDraft.id }) : t('form.newEntry')}
                    </p>
                    <AdminButton
                      type="submit"
                      disabled={faqSaving || faqDeleting}
                      size="sm"
                      variant="primary"
                    >
                      {faqSaving ? t('common.saving') : t('common.save')}
                    </AdminButton>
                  </div>
                </form>
              </div>
            </div>
          ) : tab === 'ai' ? (
            <div className="mt-[16px]">
              <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-[10px]">
                  <div>
                    <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">
                      {t('ai.title')}
                    </h2>
                    <p className="mt-[4px] font-['Outfit'] text-[13px] text-[#535353]">{t('ai.subtitle')}</p>
                  </div>
                  <AdminButton size="sm" variant="outline" onClick={() => void loadOpenAiStatus()} disabled={openAiLoading}>
                    {t('common.refresh')}
                  </AdminButton>
                </div>

                {settingsErrorCode?.startsWith('ERR_SUPABASE_MISSING_TABLE:') ? (
                  <div className="mt-[12px] rounded-[16px] border border-[#BBBBBB] bg-[#E1E1E1] p-[12px]">
                    <div className="font-['DM_Sans'] text-[13px] font-medium text-[#161616]">{t('dbSetup.title')}</div>
                    <div className="mt-[6px] font-['Outfit'] text-[12px] text-[#535353]">{t('dbSetup.subtitle')}</div>
                    <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void copyMigrationSql('chatbot_settings')}
                        disabled={dbHelpBusy}
                      >
                        {t('dbSetup.copySettings')}
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void copyMigrationSql('reload-schema')}
                        disabled={dbHelpBusy}
                      >
                        {t('dbSetup.copyReload')}
                      </AdminButton>
                    </div>
                    {dbHelpNotice ? (
                      <div className="mt-[8px] font-['Outfit'] text-[12px] text-[#161616]">{dbHelpNotice}</div>
                    ) : null}
                  </div>
                ) : null}

                {openAiError ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-red-600">{openAiError}</p>
                ) : null}

                {openAiLoading || settingsLoading ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('common.loading')}</p>
                ) : !openAiStatus ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('ai.empty')}</p>
                ) : (
                  <div className="mt-[12px] grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
                    <div className="rounded-[16px] border border-[#E1E1E1] bg-white p-[14px]">
                      <div className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{t('ai.statusTitle')}</div>
                      <div className="mt-[10px] space-y-[8px] font-['Outfit'] text-[13px] text-[#161616]">
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.configured')}</span>
                          <span className={openAiStatus.configured ? 'text-[#161616]' : 'text-red-600'}>
                            {openAiStatus.configured ? t('ai.yes') : t('ai.no')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.model')}</span>
                          <span className="font-mono text-[12px]">{openAiStatus.model}</span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.useOpenAI')}</span>
                          <span>{openAiStatus.useOpenAI ? t('ai.yes') : t('ai.no')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.openAiMode')}</span>
                          <span className="font-mono text-[12px]">{openAiStatus.openAiMode}</span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.minConfidence')}</span>
                          <span>{openAiStatus.minConfidence}</span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.temperature')}</span>
                          <span>{openAiStatus.temperature}</span>
                        </div>
                        <div className="flex items-center justify-between gap-[10px]">
                          <span>{t('ai.source')}</span>
                          <span className="font-mono text-[12px]">{openAiStatus.source}</span>
                        </div>
                      </div>

                      <div className="mt-[12px] rounded-[12px] bg-[#F5F5F5] p-[12px]">
                        <p className="font-['Outfit'] text-[12px] text-[#535353] leading-[1.4]">
                          {t('ai.note')}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-[#E1E1E1] bg-white p-[14px]">
                      <div className="flex items-center justify-between gap-[10px]">
                        <div className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{t('ai.settingsTitle')}</div>
                        <AdminButton
                          size="sm"
                          variant="primary"
                          onClick={() => void saveChatbotSettings()}
                          disabled={settingsSaving || !settingsDraft || isSettingsTableMissing}
                        >
                          {settingsSaving ? t('common.saving') : t('common.save')}
                        </AdminButton>
                      </div>

                      {settingsNotice ? (
                        <p className="mt-[10px] font-['Outfit'] text-[13px] text-[#161616]">{settingsNotice}</p>
                      ) : null}
                      {settingsError ? (
                        <p className="mt-[10px] font-['Outfit'] text-[13px] text-red-600">{settingsError}</p>
                      ) : null}

                      {settingsDraft ? (
                        <div className="mt-[10px] space-y-[10px]">
                          <label className="flex items-center justify-between gap-[10px]">
                            <span className="font-['Outfit'] text-[13px] text-[#161616]">{t('ai.useOpenAI')}</span>
                            <input
                              type="checkbox"
                              checked={settingsDraft.useOpenAI}
                              onChange={(e) =>
                                setSettingsDraft((d) => (d ? { ...d, useOpenAI: e.target.checked } : d))
                              }
                              className="h-[16px] w-[16px] accent-[#161616]"
                            />
                          </label>

                          <div className="flex items-center justify-between gap-[10px]">
                            <span className="font-['Outfit'] text-[13px] text-[#161616]">{t('ai.openAiMode')}</span>
                            <AdminSelect
                              value={settingsDraft.openAiMode}
                              onChange={(e) =>
                                setSettingsDraft((d) => (d ? { ...d, openAiMode: e.target.value as any } : d))
                              }
                              className="w-[220px]"
                            >
                              <option value="always">always</option>
                              <option value="fallback">fallback</option>
                              <option value="off">off</option>
                            </AdminSelect>
                          </div>

                          <div className="grid grid-cols-2 gap-[10px]">
                            <div>
                              <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('ai.minConfidence')}</div>
                              <AdminInput
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                value={settingsDraft.minConfidence}
                                onChange={(e) =>
                                  setSettingsDraft((d) =>
                                    d ? { ...d, minConfidence: Number(e.target.value || 0) } : d
                                  )
                                }
                                className="mt-[6px] h-[40px]"
                              />
                            </div>
                            <div>
                              <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('ai.temperature')}</div>
                              <AdminInput
                                type="number"
                                min={0}
                                max={2}
                                step={0.05}
                                value={settingsDraft.temperature}
                                onChange={(e) =>
                                  setSettingsDraft((d) =>
                                    d ? { ...d, temperature: Number(e.target.value || 0) } : d
                                  )
                                }
                                className="mt-[6px] h-[40px]"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('ai.promptLt')}</div>
                            <AdminTextarea
                              value={settingsDraft.systemPromptLt}
                              onChange={(e) =>
                                setSettingsDraft((d) => (d ? { ...d, systemPromptLt: e.target.value } : d))
                              }
                              className="mt-[6px] min-h-[120px]"
                            />
                          </div>

                          <div>
                            <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('ai.promptEn')}</div>
                            <AdminTextarea
                              value={settingsDraft.systemPromptEn}
                              onChange={(e) =>
                                setSettingsDraft((d) => (d ? { ...d, systemPromptEn: e.target.value } : d))
                              }
                              className="mt-[6px] min-h-[120px]"
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-[12px] rounded-[12px] bg-[#F5F5F5] p-[12px]">
                        <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('ai.envTitle')}</div>
                        <pre className="mt-[8px] overflow-auto text-[11px] leading-[1.4] bg-white border border-[#E1E1E1] rounded-[12px] p-[10px]">
OPENAI_API_KEY=***
OPENAI_CHAT_MODEL={openAiStatus.model}
CHATBOT_USE_OPENAI={String(openAiStatus.useOpenAI)}
CHATBOT_OPENAI_MODE={String(openAiStatus.openAiMode)}
CHATBOT_OPENAI_MIN_CONFIDENCE={String(openAiStatus.minConfidence)}
CHATBOT_OPENAI_TEMPERATURE={String(openAiStatus.temperature)}
CHATBOT_SYSTEM_PROMPT_LT=...
CHATBOT_SYSTEM_PROMPT_EN=...
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-[16px]">
              <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-[10px]">
                  <div>
                    <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('training.title')}</h2>
                    <p className="mt-[4px] font-['Outfit'] text-[13px] text-[#535353]">{t('training.subtitle')}</p>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <AdminButton
                      size="sm"
                      variant="outline"
                      onClick={() => void downloadTrainingData()}
                      disabled={trainingLoading}
                    >
                      {t('training.exportJsonl')}
                    </AdminButton>
                  </div>
                </div>

                {trainingError ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-red-600">{trainingError}</p>
                ) : null}

                <div className="mt-[12px] grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
                  <div className="rounded-[16px] border border-[#E1E1E1] bg-white p-[14px]">
                    <div className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{t('training.exportTitle')}</div>
                    <p className="mt-[6px] font-['Outfit'] text-[12px] text-[#535353] leading-[1.4]">
                      {t('training.exportNote')}
                    </p>

                    <div className="mt-[12px] flex items-center justify-between gap-[10px]">
                      <span className="font-['Outfit'] text-[13px] text-[#161616]">{t('training.locale')}</span>
                      <AdminSelect
                        value={trainingLocale}
                        onChange={(e) => setTrainingLocale(e.target.value as any)}
                        className="w-[200px]"
                      >
                        <option value="all">LT + EN</option>
                        <option value="lt">LT</option>
                        <option value="en">EN</option>
                      </AdminSelect>
                    </div>

                    <div className="mt-[12px]">
                      <AdminButton
                        size="sm"
                        variant="primary"
                        onClick={() => void downloadTrainingData()}
                        disabled={trainingLoading}
                      >
                        {trainingLoading ? t('common.loading') : t('training.exportJsonl')}
                      </AdminButton>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-[#E1E1E1] bg-white p-[14px]">
                    <div className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{t('training.fineTuneTitle')}</div>
                    <p className="mt-[6px] font-['Outfit'] text-[12px] text-[#535353] leading-[1.4]">
                      {t('training.fineTuneNote')}
                    </p>

                    <div className="mt-[12px]">
                      <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('training.baseModel')}</div>
                      <AdminInput
                        value={trainingBaseModel}
                        onChange={(e) => setTrainingBaseModel(e.target.value)}
                        className="mt-[6px] h-[40px]"
                        placeholder="gpt-4o-mini"
                      />
                    </div>

                    <div className="mt-[12px] flex flex-wrap items-center gap-[10px]">
                      <AdminButton
                        size="sm"
                        variant="primary"
                        onClick={() => void startFineTune()}
                        disabled={trainingStarting}
                      >
                        {trainingStarting ? t('training.starting') : t('training.startFineTune')}
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void refreshFineTuneStatus(fineTuneJobId)}
                        disabled={!fineTuneJobId || trainingLoading}
                      >
                        {t('training.refreshStatus')}
                      </AdminButton>
                    </div>

                    <div className="mt-[12px]">
                      <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('training.jobId')}</div>
                      <AdminInput
                        value={fineTuneJobId}
                        onChange={(e) => setFineTuneJobId(e.target.value)}
                        className="mt-[6px] h-[40px] font-mono text-[12px]"
                        placeholder="ftjob_..."
                      />
                    </div>

                    {fineTuneStatus ? (
                      <div className="mt-[12px] rounded-[12px] bg-[#F5F5F5] p-[12px]">
                        <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('training.status')}</div>
                        <div className="mt-[8px] space-y-[6px] font-['Outfit'] text-[13px] text-[#161616]">
                          <div className="flex items-center justify-between gap-[10px]">
                            <span>{t('training.statusValue')}</span>
                            <span className="font-mono text-[12px]">{fineTuneStatus.status}</span>
                          </div>
                          <div className="flex items-center justify-between gap-[10px]">
                            <span>{t('training.baseModel')}</span>
                            <span className="font-mono text-[12px]">{fineTuneStatus.model}</span>
                          </div>
                          <div className="flex items-center justify-between gap-[10px]">
                            <span>{t('training.fineTunedModel')}</span>
                            <span className="font-mono text-[12px]">{fineTuneStatus.fineTunedModel || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </AdminBody>
  );
}
