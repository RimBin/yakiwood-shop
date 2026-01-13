'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

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
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const hiddenOnPrefixes = useMemo(
    () => ['/studio', '/login', '/register', '/forgot-password', '/reset-password'],
    []
  );

  const normalized = (pathname || '/').replace(/^\/(lt|en)(?=\/|$)/, '');
  const shouldHide = hiddenOnPrefixes.some((p) => normalized === p || normalized.startsWith(`${p}/`));

  const [messages, setMessages] = useState<Message[]>([]);
  const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);

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
          locale: locale === 'en' ? 'en' : 'lt',
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
      {open && (
        <div className="mb-[12px] w-[320px] sm:w-[360px] rounded-[24px] border border-[#BBBBBB] bg-white shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[#E1E1E1]">
            <div>
              <div className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{t('title')}</div>
              <div className="font-['Outfit'] text-[12px] text-[#535353]">{t('subtitle')}</div>
            </div>
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={clearChat}
                className="h-[32px] px-[10px] rounded-[100px] border border-[#BBBBBB] font-['Outfit'] text-[11px] text-[#161616] hover:bg-[#F5F5F5]"
              >
                {t('clear')}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-[32px] w-[32px] rounded-full border border-[#161616] text-[#161616] hover:bg-[#F5F5F5]"
                aria-label="Uždaryti"
              >
                ×
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[360px] overflow-y-auto px-[12px] py-[12px] space-y-[10px]">
            <div className="rounded-[16px] bg-[#F5F5F5] px-[12px] py-[10px]">
              <p className="font-['Outfit'] text-[12px] text-[#535353] leading-[1.4]">
                {t('note')}
              </p>
            </div>

            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-[16px] bg-[#161616] text-white px-[12px] py-[10px]'
                      : 'max-w-[85%] rounded-[16px] bg-[#F5F5F5] text-[#161616] px-[12px] py-[10px]'
                  }
                >
                  <p className="font-['Outfit'] text-[13px] leading-[1.4] whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[16px] bg-[#F5F5F5] text-[#161616] px-[12px] py-[10px]">
                  <p className="font-['Outfit'] text-[13px] leading-[1.4]">{t('typing')}</p>
                </div>
              </div>
            )}

            <div className="pt-[6px]">
              <div className="flex flex-wrap gap-[8px]">
                {(serverSuggestions.length > 0 ? serverSuggestions : suggestions).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={busy}
                    className="text-left rounded-[100px] border border-[#BBBBBB] px-[10px] py-[6px] font-['Outfit'] text-[12px] text-[#161616] hover:bg-[#F5F5F5] disabled:opacity-60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-[8px]">
              <Link
                href="/kontaktai"
                className="inline-block font-['Outfit'] text-[12px] underline underline-offset-2 text-[#161616] hover:opacity-80"
              >
                {t('handoff')}
              </Link>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-[#E1E1E1] p-[12px] flex gap-[8px]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              className="flex-1 h-[40px] rounded-[100px] border border-[#BBBBBB] px-[14px] font-['Outfit'] text-[13px] outline-none focus:border-[#161616]"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="h-[40px] rounded-[100px] bg-[#161616] text-white px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] disabled:opacity-60"
            >
              {t('send')}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[52px] rounded-[100px] bg-[#161616] text-white px-[16px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] shadow-lg hover:opacity-90"
        aria-label="Atidaryti pagalbą"
      >
        {t('button')}
      </button>
    </div>
  );
}
