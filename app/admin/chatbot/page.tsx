'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/ui';

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

export default function AdminChatbotPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSessions() {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/chatbot?action=sessions&limit=50');
      const json = await resp.json();
      setSessions(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents(sessionId: string) {
    const resp = await fetch(
      `/api/admin/chatbot?action=events&sessionId=${encodeURIComponent(sessionId)}&limit=300`
    );
    const json = await resp.json();
    setEvents(json.data || []);
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (selected) void loadEvents(selected);
  }, [selected]);

  return (
    <div className="px-[16px] sm:px-[40px] py-[24px]">
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Chatbot', href: '/admin/chatbot' },
        ]}
      />

      <div className="mt-[16px] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
        <div className="rounded-[24px] border border-[#BBBBBB] bg-white p-[16px]">
          <div className="flex items-center justify-between">
            <h1 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">Chatbot sesijos</h1>
            <button
              onClick={() => void loadSessions()}
              className="border border-[#161616] rounded-[100px] h-[36px] px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#F5F5F5]"
            >
              Atnaujinti
            </button>
          </div>

          {loading ? (
            <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">Kraunama…</p>
          ) : sessions.length === 0 ? (
            <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">Kol kas nėra sesijų.</p>
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
                    {s.sessionId.slice(0, 8)}… • {s.eventCount} įvyk.
                  </div>
                  <div className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">
                    {s.lastMessagePreview || '—'}
                  </div>
                  <div className="font-['Outfit'] text-[11px] text-[#888] mt-[6px]">
                    {new Date(s.lastAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-[#BBBBBB] bg-white p-[16px]">
          <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">Pokalbis</h2>
          {!selected ? (
            <p className="mt-[12px] font-['Outfit'] text-[13px] text-[#535353]">Pasirink sesiją kairėje.</p>
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
                      {e.role} • {new Date(e.createdAt).toLocaleString()}
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
    </div>
  );
}
