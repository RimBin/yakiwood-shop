'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import { useCartStore } from '@/lib/cart/store';

type BotAction =
  | {
      type: 'open_product';
      label: string;
      href: string;
    }
  | {
      type: 'add_to_cart';
      label: string;
      item: { id: string; name: string; slug: string; basePrice: number; quantity?: number };
    };

type BotResponse = {
  ok: boolean;
  data?: {
    reply: string;
    faqId: string;
    confidence: number;
    suggestions: string[];
    actions?: BotAction[];
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
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('chatbot');
  const currentLocale = locale === 'en' ? 'en' : 'lt';
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
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
  const [serverActions, setServerActions] = useState<BotAction[]>([]);
  const [serverHandoff, setServerHandoff] = useState<{ label: string; href: string } | null>(null);

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
      t('suggestions.payment'),
      t('suggestions.returns'),
      t('suggestions.cart'),
      t('suggestions.productionTime'),
      t('suggestions.maintenance'),
      t('suggestions.samples'),
    ];
  }, [t]);

  const handoff = useMemo(() => {
    return (
      serverHandoff ??
      (currentLocale === 'en'
        ? { label: 'Contact', href: '/contact' }
        : { label: 'Kontaktai', href: '/kontaktai' })
    );
  }, [currentLocale, serverHandoff]);

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

  const visibleSuggestions = useMemo(() => {
    const next = serverSuggestions.length > 0 ? serverSuggestions : suggestions;
    return next.slice(0, 10);
  }, [serverSuggestions, suggestions]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!sessionId) return;

    setBusy(true);
    setServerActions([]);
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
      if (Array.isArray(data.data.actions) && data.data.actions.length > 0) {
        setServerActions(data.data.actions.slice(0, 4));
      }
      if (data.data.handoff && typeof data.data.handoff.href === 'string') {
        setServerHandoff(data.data.handoff);
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
    setServerActions([]);
    setServerHandoff(null);
    setMessages(fresh);
    safeWriteHistory(sessionId, fresh);
  }

  function openHandoff() {
    // API already returns the correct locale-specific contact path.
    router.push(handoff.href);
    setOpen(false);
  }

  function runAction(action: BotAction) {
    if (busy) return;
    if (action.type === 'open_product') {
      const href = toLocalePath(action.href, currentLocale);
      router.push(href);
      setOpen(false);
      return;
    }

    if (action.type === 'add_to_cart') {
      const qty = typeof action.item.quantity === 'number' && action.item.quantity > 0 ? action.item.quantity : 1;
      addItem({
        id: action.item.id,
        name: action.item.name,
        slug: action.item.slug,
        basePrice: action.item.basePrice,
        quantity: qty,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: currentLocale === 'en' ? 'Added to cart.' : 'Įdėjau į krepšelį.',
        },
      ]);
      return;
    }
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
              'h-[calc(100vh-36px)] sm:h-[680px] '
            }
          >
            <div className="flex h-full flex-col sm:max-h-[640px]">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F0F0F_0%,#2A2A2A_40%,#161616_100%)]" />
                <div className="absolute -right-[80px] -top-[90px] h-[200px] w-[200px] rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-start justify-between px-[16px] py-[14px]">
                  <div className="flex items-start gap-[10px]">
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
                      <div className="mt-[2px] max-w-[220px] font-['Outfit'] text-[11px] leading-[1.35] text-white/70">
                        {t('subtitle')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      onClick={clearChat}
                      className="h-[30px] rounded-full bg-white/10 px-[12px] text-[11px] font-['Outfit'] text-white/90 ring-1 ring-white/15 hover:bg-white/15"
                      aria-label={t('clear')}
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

              <div
                ref={listRef}
                className="flex-1 overflow-y-auto bg-[#FAFAFA] px-[12px] py-[12px]"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                aria-busy={busy}
              >
                <div className="space-y-[12px]">
                  <div className="rounded-[14px] border border-black/5 bg-white px-[12px] py-[10px] shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
                    <div className="mb-[6px] text-[10px] font-['Outfit'] uppercase tracking-[0.12em] text-[#7C7C7C]">
                      {currentLocale === 'en' ? 'Important' : 'Svarbu'}
                    </div>
                    <p className="font-['Outfit'] text-[11px] leading-[1.4] text-[#535353]">{t('note')}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-['Outfit'] uppercase tracking-[0.12em] text-[#7C7C7C]">
                      {currentLocale === 'en' ? 'Conversation' : 'Pokalbis'}
                    </div>
                  </div>
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

                {visibleSuggestions.length > 0 && (
                  <div className="mt-[16px]">
                    <div className="mb-[8px] text-[10px] font-['Outfit'] uppercase tracking-[0.12em] text-[#7C7C7C]">
                      {currentLocale === 'en' ? 'Quick questions' : 'Greitieji klausimai'}
                    </div>
                    {serverActions.length > 0 && (
                      <div className="mb-[10px] flex flex-wrap gap-[8px]">
                        {serverActions.map((a, idx) => (
                          <button
                            key={`${a.type}:${idx}`}
                            type="button"
                            onClick={() => runAction(a)}
                            disabled={busy}
                            className={cx(
                              'rounded-[999px] px-[14px] py-[10px] ring-1 ring-black/5 font-[\'Outfit\'] text-[12px] shadow-sm disabled:opacity-60',
                              a.type === 'add_to_cart'
                                ? 'bg-[#161616] text-white hover:opacity-90'
                                : 'bg-white text-[#161616] hover:bg-[#F5F5F5]'
                            )}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                      {visibleSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            // Built-in "chat with human" handoff.
                            // Reuse the existing translated suggestion label (EN: "Contact support").
                            if (s === t('suggestions.samples')) {
                              openHandoff();
                              return;
                            }
                            void send(s);
                          }}
                          disabled={busy}
                          className="w-full text-left rounded-[16px] bg-white px-[12px] py-[10px] ring-1 ring-black/5 font-['Outfit'] text-[12px] text-[#161616] hover:bg-[#F5F5F5] disabled:opacity-60"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative border-t border-[#EAEAEA] bg-white p-[12px]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                  className="flex items-end gap-[10px]"
                >
                  <div className="flex-1 rounded-[999px] bg-[#FAFAFA] ring-1 ring-black/5 px-[14px] py-[10px] focus-within:ring-2 focus-within:ring-[#161616]/20">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('placeholder')}
                      aria-label={t('placeholder')}
                      autoComplete="off"
                      enterKeyHint="send"
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

                <button
                  type="button"
                  onClick={openHandoff}
                  className="mt-[10px] w-full text-left font-['Outfit'] text-[12px] text-[#535353] hover:text-[#161616]"
                >
                  <span className="underline underline-offset-4">{t('handoff')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-[56px] w-[56px] rounded-full border border-[#BBBBBB] bg-[#161616] text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] hover:opacity-90 grid place-items-center"
          aria-label={t('aria.open')}
          aria-haspopup="dialog"
          aria-expanded={open}
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
      )}
    </div>
  );
}
