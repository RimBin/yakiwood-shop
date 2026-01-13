'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageLayout } from '@/components/shared/PageLayout';
import { createClient } from '@/lib/supabase/client';

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
    <div className="inline-flex rounded-[100px] border border-[#161616] overflow-hidden">
      <button
        type="button"
        onClick={() => onChange('lt')}
        className={
          "h-[36px] px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] " +
          (value === 'lt' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616] hover:bg-[#F5F5F5]')
        }
        aria-pressed={value === 'lt'}
      >
        LT
      </button>
      <div className="w-[1px] bg-[#161616] opacity-20" />
      <button
        type="button"
        onClick={() => onChange('en')}
        className={
          "h-[36px] px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] " +
          (value === 'en' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616] hover:bg-[#F5F5F5]')
        }
        aria-pressed={value === 'en'}
      >
        EN
      </button>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-[40px] px-[16px] rounded-[100px] border font-['Outfit'] text-[12px] uppercase tracking-[0.6px] " +
        (active
          ? 'border-[#161616] bg-[#161616] text-white'
          : 'border-[#161616] bg-white text-[#161616] hover:bg-[#F5F5F5]')
      }
    >
      {children}
    </button>
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

  const [tab, setTab] = useState<'sessions' | 'faq'>('sessions');

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
  const [faqNotice, setFaqNotice] = useState<string | null>(null);

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
      setFaqNotice(null);
      try {
        const resp = await fetchAdmin(`/api/admin/chatbot-faq?locale=${encodeURIComponent(locale)}`, {
          method: 'GET',
        });
        const json = await safeJson<FaqEntry[]>(resp);
        const errorMsg = translateApiError(getErrorMessageKey(resp, json.error));
        if (errorMsg) {
          setFaqError(errorMsg);
          setFaqEntries([]);
          return;
        }
        setFaqEntries((json.data || []).slice().sort((a, b) => a.order - b.order));
      } catch {
        setFaqError(t('errors.loadFaqFailed'));
        setFaqEntries([]);
      } finally {
        faqFetchedLocalesRef.current.add(locale);
        setFaqLoading(false);
      }
    },
    [fetchAdmin, t, translateApiError]
  );

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
    if (!faqSelectedId) return;
    const entry = faqEntries.find((e) => e.id === faqSelectedId);
    if (entry) setDraftFromEntry(entry);
  }, [faqEntries, faqSelectedId, setDraftFromEntry]);

  const buttonSecondary =
    "border border-[#161616] rounded-[100px] h-[36px] px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#F5F5F5]";

  const panelClass = 'rounded-[16px] border border-[#BBBBBB] bg-white p-[16px]';

  const roleLabel = (role: ChatEvent['role']) => {
    if (role === 'user') return t('roles.user');
    if (role === 'assistant') return t('roles.assistant');
    return t('roles.system');
  };

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      <PageLayout>
        <div className="py-[24px] md:py-[40px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <TabButton active={tab === 'sessions'} onClick={() => setTab('sessions')}>
              {t('tabs.sessions')}
            </TabButton>
            <TabButton active={tab === 'faq'} onClick={() => setTab('faq')}>
              {t('tabs.faq')}
            </TabButton>
          </div>

          {tab === 'sessions' ? (
            <div className="mt-[16px] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
              <div className={panelClass}>
                <div className="flex items-center justify-between">
                  <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('sessions.title')}</h2>
                  <button onClick={() => void loadSessions()} className={buttonSecondary}>
                    {t('common.refresh')}
                  </button>
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
                            ? 'border-[#161616] bg-[#F5F5F5]'
                            : 'border-[#BBBBBB] bg-white hover:bg-[#F8F8F8]')
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
                              : 'max-w-[85%] rounded-[16px] bg-[#F5F5F5] text-[#161616] px-[12px] py-[10px]'
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
          ) : (
            <div className="mt-[16px] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
              <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-[10px]">
                  <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('faq.title')}</h2>
                  <div className="flex items-center gap-[10px]">
                    <LocaleSelector value={faqLocale} onChange={setFaqLocale} />
                    <button
                      type="button"
                      onClick={() => void loadFaqEntries(faqLocale)}
                      disabled={faqLoading}
                      className={buttonSecondary + (faqLoading ? ' opacity-60 cursor-not-allowed' : '')}
                    >
                      {t('common.refresh')}
                    </button>
                    <button type="button" onClick={() => newFaqDraft(faqLocale)} className={buttonSecondary}>
                      {t('common.new')}
                    </button>
                  </div>
                </div>

                {faqError ? <p className="mt-[12px] font-['Outfit'] text-[13px] text-red-600">{faqError}</p> : null}

                {faqLoading ? (
                  <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">{t('common.loading')}</p>
                ) : faqEntries.length === 0 ? (
                  <div className="mt-[12px]">
                    <p className="font-['Outfit'] text-[13px] text-[#535353]">{t('faq.empty')}</p>
                    <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                      <button
                        type="button"
                        onClick={() => void importDefaultFaq(faqLocale)}
                        disabled={faqImporting || faqLoading}
                        className={
                          buttonSecondary +
                          (faqImporting || faqLoading ? ' opacity-60 cursor-not-allowed' : '')
                        }
                      >
                        {faqImporting ? t('faq.importing') : t('faq.importDefaults')}
                      </button>
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
                              ? 'border-[#161616] bg-[#F5F5F5]'
                              : 'border-[#BBBBBB] bg-white hover:bg-[#F8F8F8]')
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
                    <button
                      type="button"
                      onClick={() => void saveFaq()}
                      disabled={faqSaving || faqDeleting}
                      className={buttonSecondary + (faqSaving || faqDeleting ? ' opacity-60 cursor-not-allowed' : '')}
                    >
                      {faqSaving ? t('common.saving') : t('common.save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteFaq()}
                      disabled={!faqDraft.id || faqDeleting || faqSaving}
                      className={
                        buttonSecondary +
                        (!faqDraft.id || faqDeleting || faqSaving ? ' opacity-60 cursor-not-allowed' : '')
                      }
                    >
                      {faqDeleting ? t('common.deleting') : t('common.delete')}
                    </button>
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
                      <input
                        type="number"
                        value={faqDraft.order}
                        onChange={(e) =>
                          setFaqDraft((d) => ({ ...d, order: Number.parseInt(e.target.value || '0', 10) }))
                        }
                        className="h-[36px] w-[120px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px] text-[#161616]"
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
                    <input
                      type="text"
                      value={faqDraft.question}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, question: e.target.value }))}
                      className="h-[40px] w-full rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px] text-[#161616]"
                      placeholder={t('form.placeholders.question')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.answer')}</label>
                    <textarea
                      value={faqDraft.answer}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, answer: e.target.value }))}
                      className="min-h-[180px] w-full rounded-[12px] border border-[#BBBBBB] px-[12px] py-[10px] font-['Outfit'] text-[13px] text-[#161616]"
                      placeholder={t('form.placeholders.answer')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.keywords')}</label>
                    <input
                      type="text"
                      value={faqDraft.keywordsText}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, keywordsText: e.target.value }))}
                      className="h-[40px] w-full rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px] text-[#161616]"
                      placeholder={t('form.placeholders.keywords')}
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[13px] text-[#161616] mb-[6px]">{t('form.suggestions')}</label>
                    <input
                      type="text"
                      value={faqDraft.suggestionsText}
                      onChange={(e) => setFaqDraft((d) => ({ ...d, suggestionsText: e.target.value }))}
                      className="h-[40px] w-full rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px] text-[#161616]"
                      placeholder={t('form.placeholders.suggestions')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-['Outfit'] text-[12px] text-[#535353]">
                      {faqDraft.id ? t('form.id', { id: faqDraft.id }) : t('form.newEntry')}
                    </p>
                    <button
                      type="submit"
                      disabled={faqSaving || faqDeleting}
                      className={buttonSecondary + (faqSaving || faqDeleting ? ' opacity-60 cursor-not-allowed' : '')}
                    >
                      {faqSaving ? t('common.saving') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </section>
  );
}
