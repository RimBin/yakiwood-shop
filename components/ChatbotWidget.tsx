'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

type BotResponse = {
  ok: boolean;
  data?: {
    reply: string;
    faqId: string;
    confidence: number;
    suggestions: string[];
    handoff: { label: string; href: string };
  };
  error?: string;
};

type Message = { role: 'user' | 'assistant'; text: string };

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function historyKey(sessionId: string): string {
  return `yakiwood_chatbot_history:${sessionId}`;
}

function safeReadHistory(sessionId: string): Message[] | null {
  try {
    const raw = window.localStorage.getItem(historyKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const messages: Message[] = parsed
      .filter((m) => m && (m as any).role && (m as any).text)
      .map((m): Message => {
        const role: Message['role'] = (m as any).role === 'user' ? 'user' : 'assistant';
        return {
          role,
          text: String((m as any).text),
        };
      })
      .slice(-40);

    return messages;
  } catch {
    return null;
  }
}

function safeWriteHistory(sessionId: string, messages: Message[]) {
  try {
    window.localStorage.setItem(historyKey(sessionId), JSON.stringify(messages.slice(-40)));
  } catch {
    // ignore
  }
}

function getOrCreateSessionId(): string {
  const key = 'yakiwood_chatbot_session';
  const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  if (existing && existing.length >= 8) return existing;

  const sid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  window.localStorage.setItem(key, sid);
  return sid;
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('chatbot');
  const currentLocale = locale === 'en' ? 'en' : 'lt';
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hiddenOnPrefixes = useMemo(
    () => ['/studio', '/login', '/register', '/forgot-password', '/reset-password'],
    []
  );

  const normalized = (pathname || '/').replace(/^\/(lt|en)(?=\/|$)/, '');
  const shouldHide = hiddenOnPrefixes.some((p) => normalized === p || normalized.startsWith(`${p}/`));

  const [messages, setMessages] = useState<Message[]>([]);
  const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    // Default welcome (used when there is no persisted history)
    setMessages([
      {
        role: 'assistant',
        text: t('welcome'),
      },
    ]);
  }, [t]);

  const suggestions = useMemo(() => {
    return [
      t('suggestions.price'),
      t('suggestions.delivery'),
      t('suggestions.productionTime'),
      t('suggestions.maintenance'),
      t('suggestions.samples'),
    ];
  }, [t]);

  useEffect(() => {
    if (shouldHide) return;
    setSessionId(getOrCreateSessionId());
  }, [shouldHide]);

  useEffect(() => {
    if (!sessionId) return;
    const stored = safeReadHistory(sessionId);
    if (stored && stored.length > 0) {
      setMessages(stored);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    safeWriteHistory(sessionId, messages);
  }, [messages, sessionId]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) setActionsOpen(false);
  }, [open]);

  const visibleSuggestions = useMemo(() => {
    const next = serverSuggestions.length > 0 ? serverSuggestions : suggestions;
    return next.slice(0, 8);
  }, [serverSuggestions, suggestions]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!sessionId) return;

    setBusy(true);
    const historyForApi = messages
      .filter((m) => m.text && m.text.trim().length > 0)
      .slice(-16)
      .map((m) => ({ role: m.role, text: m.text }));
    const nextMessages = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(nextMessages);
    setInput('');

    try {
      const resp = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          page: pathname || '/',
          locale: currentLocale,
          history: historyForApi,
        }),
      });

      const data = (await resp.json()) as BotResponse;
      if (!resp.ok || !data.ok || !data.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || t('errors.generic') },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: data.data!.reply }]);
      if (Array.isArray(data.data.suggestions) && data.data.suggestions.length > 0) {
        setServerSuggestions(data.data.suggestions.slice(0, 8));
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t('errors.network') }]);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    if (!sessionId) return;
    const fresh: Message[] = [{ role: 'assistant', text: t('welcome') }];
    setServerSuggestions([]);
    setMessages(fresh);
    safeWriteHistory(sessionId, fresh);
  }

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-[18px] right-[18px] z-50">
      {open ? (
        <div
          className="fixed inset-0 z-50 sm:inset-auto sm:static"
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
          onMouseDown={(e) => {
            if (!panelRef.current) return;
            if (e.target instanceof Node && !panelRef.current.contains(e.target)) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/20 sm:hidden" />
          <div
            ref={panelRef}
            className={
              'absolute bottom-[18px] right-[18px] sm:static ' +
              'w-[calc(100vw-36px)] max-w-[420px] sm:w-[380px] ' +
              'rounded-[28px] border border-[#E1E1E1] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden ' +
              'h-[calc(100vh-36px)] sm:h-auto sm:max-h-[640px] '
            }
          >
            <div className="flex h-full flex-col sm:max-h-[640px]">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F0F0F_0%,#2A2A2A_40%,#161616_100%)]" />
                <div className="absolute -right-[80px] -top-[90px] h-[200px] w-[200px] rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-center justify-between px-[16px] py-[14px]">
                  <div className="flex items-center gap-[10px]">
                    <div className="h-[36px] w-[36px] rounded-full bg-white/10 ring-1 ring-white/15 grid place-items-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7 18L4 21V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H7Z"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path d="M8 8H16" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M8 12H14" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-['DM_Sans'] text-[14px] font-semibold tracking-[-0.2px] text-white">
                        {t('title')}
                      </div>
                      <div className="font-['Outfit'] text-[12px] text-white/70">{t('subtitle')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      onClick={clearChat}
                      className="h-[34px] px-[10px] rounded-[999px] bg-white/10 text-white ring-1 ring-white/15 font-['Outfit'] text-[11px] hover:bg-white/15"
                    >
                      {t('clear')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-[34px] w-[34px] rounded-full bg-white/10 ring-1 ring-white/15 text-white hover:bg-white/15 grid place-items-center"
                      aria-label={t('aria.close')}
                    >
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 1L13 13M13 1L1 13"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto bg-[#FAFAFA] px-[12px] py-[12px]" aria-live="polite">
                <div className="rounded-[18px] bg-white px-[12px] py-[10px] ring-1 ring-black/5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                  <p className="font-['Outfit'] text-[12px] text-[#535353] leading-[1.45]">{t('note')}</p>
                </div>

                <div className="mt-[12px] space-y-[10px]">
                  {messages.map((m, idx) => {
                    const prev = idx > 0 ? messages[idx - 1] : null;
                    const startsBlock = !prev || prev.role !== m.role;
                    const isUser = m.role === 'user';

                    return (
                      <div key={idx} className={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
                        {!isUser && (
                          <div className={cx('mr-[8px] w-[26px] shrink-0', startsBlock ? 'opacity-100' : 'opacity-0')} aria-hidden={!startsBlock}>
                            <div className="h-[26px] w-[26px] rounded-full bg-[#161616] text-white grid place-items-center shadow-sm">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M7 18L4 21V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H7Z"
                                  stroke="white"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}

                        <div
                          className={cx(
                            'max-w-[85%] rounded-[18px] px-[12px] py-[10px] ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.06)]',
                            isUser
                              ? 'bg-[linear-gradient(135deg,#161616_0%,#2D2D2D_100%)] text-white rounded-br-[8px]'
                              : 'bg-white text-[#161616] rounded-bl-[8px]'
                          )}
                        >
                          <p className="font-['Outfit'] text-[13px] leading-[1.45] whitespace-pre-line">{m.text}</p>
                        </div>
                      </div>
                    );
                  })}

                  {busy && (
                    <div className="flex justify-start">
                      <div className="mr-[8px] w-[26px] shrink-0">
                        <div className="h-[26px] w-[26px] rounded-full bg-[#161616] text-white grid place-items-center shadow-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M7 18L4 21V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H7Z"
                              stroke="white"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="max-w-[75%] rounded-[18px] rounded-bl-[8px] bg-white text-[#161616] px-[12px] py-[10px] ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-[6px]">
                          <span className="h-[6px] w-[6px] rounded-full bg-[#BBBBBB] animate-pulse" />
                          <span className="h-[6px] w-[6px] rounded-full bg-[#BBBBBB] animate-pulse" />
                          <span className="h-[6px] w-[6px] rounded-full bg-[#BBBBBB] animate-pulse" />
                          <span className="ml-[6px] font-['Outfit'] text-[12px] text-[#535353]">{t('typing')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-[12px]">
                  <div className="flex gap-[8px] overflow-x-auto pb-[2px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {visibleSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        disabled={busy}
                        className="shrink-0 rounded-[999px] bg-white px-[12px] py-[8px] ring-1 ring-black/5 font-['Outfit'] text-[12px] text-[#161616] hover:bg-[#F5F5F5] disabled:opacity-60"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-[10px]">
                  <Link
                    href={toLocalePath('/kontaktai', currentLocale)}
                    className="inline-flex items-center gap-[8px] font-['Outfit'] text-[12px] text-[#161616] hover:opacity-80"
                  >
                    <span className="underline underline-offset-2">{t('handoff')}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M9 7H17V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="relative border-t border-[#EAEAEA] bg-white p-[12px]">
                {actionsOpen && (
                  <div className="absolute bottom-[66px] left-[12px] right-[12px] rounded-[20px] bg-white p-[12px] ring-1 ring-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                    <div className="flex flex-wrap gap-[8px]">
                      {visibleSuggestions.slice(0, 6).map((s) => (
                        <button
                          key={`action_${s}`}
                          type="button"
                          onClick={() => {
                            setActionsOpen(false);
                            void send(s);
                          }}
                          disabled={busy}
                          className="rounded-[999px] bg-[#FAFAFA] px-[12px] py-[8px] ring-1 ring-black/5 font-['Outfit'] text-[12px] text-[#161616] hover:bg-[#F5F5F5] disabled:opacity-60"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                  className="flex items-end gap-[10px]"
                >
                  <button
                    type="button"
                    onClick={() => setActionsOpen((v) => !v)}
                    className="h-[42px] w-[42px] rounded-full bg-[#FAFAFA] ring-1 ring-black/5 grid place-items-center hover:bg-[#F5F5F5]"
                    aria-label={t('clear')}
                    aria-pressed={actionsOpen}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 5V19" stroke="#161616" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M5 12H19" stroke="#161616" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>

                  <div className="flex-1 rounded-[999px] bg-[#FAFAFA] ring-1 ring-black/5 px-[14px] py-[10px]">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('placeholder')}
                      className="w-full bg-transparent font-['Outfit'] text-[13px] outline-none placeholder:text-[#7C7C7C]"
                      disabled={busy}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="h-[42px] w-[42px] rounded-full bg-[#161616] text-white grid place-items-center shadow-md hover:opacity-90 disabled:opacity-60"
                    aria-label={t('send')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path
                        d="M4 12L20 4L13 20L11 13L4 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[56px] w-[56px] rounded-full bg-[#161616] text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] hover:opacity-90 grid place-items-center"
        aria-label={t('aria.open')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M7 18L4 21V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 12H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
