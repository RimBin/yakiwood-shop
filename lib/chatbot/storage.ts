import { supabaseAdmin } from '@/lib/supabase-admin';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatEvent = {
  id: string;
  sessionId: string;
  role: ChatRole;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
};

export type ChatSessionSummary = {
  sessionId: string;
  createdAt: string;
  lastAt: string;
  eventCount: number;
  lastMessagePreview: string;
};

type InMemoryStore = {
  sessions: Map<string, { createdAt: string; events: ChatEvent[] }>;
};

function getStore(): InMemoryStore {
  const g = globalThis as unknown as { __ywChatbotStore?: InMemoryStore };
  if (!g.__ywChatbotStore) {
    g.__ywChatbotStore = { sessions: new Map() };
  }
  return g.__ywChatbotStore;
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function appendEvent(event: {
  sessionId: string;
  role: ChatRole;
  message: string;
  meta?: Record<string, unknown>;
}) {
  const createdAt = new Date().toISOString();
  const id = makeId();

  if (supabaseAdmin) {
    try {
      await supabaseAdmin
        .from('chatbot_sessions')
        .upsert({ session_id: event.sessionId, updated_at: createdAt }, { onConflict: 'session_id' });

      await supabaseAdmin.from('chatbot_events').insert({
        session_id: event.sessionId,
        role: event.role,
        message: event.message,
        meta: event.meta ?? {},
        created_at: createdAt,
      });

      return { id, createdAt };
    } catch {
      // Fall back to in-memory store (dev/local without DB)
    }
  }

  const store = getStore();
  const existing = store.sessions.get(event.sessionId);
  if (!existing) {
    store.sessions.set(event.sessionId, { createdAt, events: [] });
  }

  const session = store.sessions.get(event.sessionId)!;
  session.events.push({
    id,
    sessionId: event.sessionId,
    role: event.role,
    message: event.message,
    meta: event.meta,
    createdAt,
  });

  return { id, createdAt };
}

export async function listSessions(limit = 50): Promise<ChatSessionSummary[]> {
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('chatbot_sessions')
        .select('session_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);

      const sessions = (data ?? []).map((s) => ({
        sessionId: s.session_id as string,
        createdAt: (s.created_at as string) ?? (s.updated_at as string),
        lastAt: (s.updated_at as string) ?? (s.created_at as string),
        eventCount: 0,
        lastMessagePreview: '',
      }));

      for (const session of sessions) {
        const { data: last } = await supabaseAdmin
          .from('chatbot_events')
          .select('message, created_at')
          .eq('session_id', session.sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        const { count } = await supabaseAdmin
          .from('chatbot_events')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.sessionId);

        session.eventCount = count ?? 0;
        session.lastMessagePreview = (last?.[0]?.message as string | undefined)?.slice(0, 120) ?? '';
      }

      return sessions;
    } catch {
      // fall back
    }
  }

  const store = getStore();
  const summaries: ChatSessionSummary[] = [];

  for (const [sessionId, session] of store.sessions.entries()) {
    const last = session.events[session.events.length - 1];
    summaries.push({
      sessionId,
      createdAt: session.createdAt,
      lastAt: last?.createdAt ?? session.createdAt,
      eventCount: session.events.length,
      lastMessagePreview: (last?.message ?? '').slice(0, 120),
    });
  }

  summaries.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  return summaries.slice(0, limit);
}

export async function getSessionEvents(sessionId: string, limit = 200): Promise<ChatEvent[]> {
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('chatbot_events')
        .select('id, session_id, role, message, meta, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      return (data ?? []).map((row) => ({
        id: (row.id as string) ?? makeId(),
        sessionId: row.session_id as string,
        role: row.role as ChatRole,
        message: row.message as string,
        meta: (row.meta as Record<string, unknown> | null) ?? {},
        createdAt: row.created_at as string,
      }));
    } catch {
      // fall back
    }
  }

  const store = getStore();
  return store.sessions.get(sessionId)?.events.slice(-limit) ?? [];
}
