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

type ReadOptions = {
  preferFallback?: boolean;
};

function hasSupabaseError(result: { error?: { message?: string } | null } | null | undefined): boolean {
  return Boolean(result?.error);
}

function isMissingSupabaseTableError(message: string | null | undefined): boolean {
  const m = String(message || '').toLowerCase();
  return (
    m.includes('could not find the table') ||
    (m.includes('schema cache') && m.includes('table')) ||
    (m.includes('relation') && m.includes('does not exist'))
  );
}

function shouldFallback(options?: ReadOptions): boolean {
  return options?.preferFallback !== false;
}

type InMemoryStore = {
  sessions: Map<string, { createdAt: string; events: ChatEvent[] }>;
};

type PersistedStore = {
  sessions: Record<string, { createdAt: string; events: ChatEvent[] }>;
};

const FALLBACK_FILE = '.next/cache/chatbot-sessions.json';

function getStore(): InMemoryStore {
  const g = globalThis as unknown as { __ywChatbotStore?: InMemoryStore };
  if (!g.__ywChatbotStore) {
    g.__ywChatbotStore = { sessions: new Map() };
  }
  return g.__ywChatbotStore;
}

function toSerializableStore(store: InMemoryStore): PersistedStore {
  const sessions: PersistedStore['sessions'] = {};
  for (const [sessionId, session] of store.sessions.entries()) {
    sessions[sessionId] = {
      createdAt: session.createdAt,
      events: session.events,
    };
  }
  return { sessions };
}

function fromSerializableStore(input: unknown): InMemoryStore {
  const sessionsMap = new Map<string, { createdAt: string; events: ChatEvent[] }>();
  if (!input || typeof input !== 'object') {
    return { sessions: sessionsMap };
  }

  const root = input as { sessions?: Record<string, { createdAt?: unknown; events?: unknown }> };
  const sessions = root.sessions;
  if (!sessions || typeof sessions !== 'object') {
    return { sessions: sessionsMap };
  }

  for (const [sessionId, rawSession] of Object.entries(sessions)) {
    if (!rawSession || typeof rawSession !== 'object') continue;
    const createdAt = typeof rawSession.createdAt === 'string' ? rawSession.createdAt : new Date().toISOString();
    const eventsRaw = Array.isArray(rawSession.events) ? rawSession.events : [];
    const events: ChatEvent[] = eventsRaw
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const row = item as Partial<ChatEvent>;
        return {
          id: typeof row.id === 'string' ? row.id : makeId(),
          sessionId: typeof row.sessionId === 'string' ? row.sessionId : sessionId,
          role: row.role === 'user' || row.role === 'assistant' ? row.role : 'system',
          message: typeof row.message === 'string' ? row.message : '',
          meta: row.meta && typeof row.meta === 'object' ? row.meta : {},
          createdAt: typeof row.createdAt === 'string' ? row.createdAt : createdAt,
        };
      });

    sessionsMap.set(sessionId, { createdAt, events });
  }

  return { sessions: sessionsMap };
}

async function loadFallbackStore(): Promise<InMemoryStore> {
  const store = getStore();
  if (store.sessions.size > 0) return store;

  try {
    const [{ readFile }, path] = await Promise.all([import('fs/promises'), import('path')]);
    const file = path.join(process.cwd(), FALLBACK_FILE);
    const raw = await readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const loaded = fromSerializableStore(parsed);
    if (loaded.sessions.size > 0) {
      store.sessions = loaded.sessions;
    }
  } catch {
    // ignore fallback file read errors
  }

  return store;
}

async function persistFallbackStore(store: InMemoryStore): Promise<void> {
  try {
    const [{ mkdir, writeFile }, path] = await Promise.all([import('fs/promises'), import('path')]);
    const file = path.join(process.cwd(), FALLBACK_FILE);
    const dir = path.dirname(file);
    await mkdir(dir, { recursive: true });
    await writeFile(file, JSON.stringify(toSerializableStore(store)), 'utf8');
  } catch {
    // ignore fallback file write errors (read-only fs, etc.)
  }
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
      const upsertSession = await supabaseAdmin
        .from('chatbot_sessions')
        .upsert({ session_id: event.sessionId, updated_at: createdAt }, { onConflict: 'session_id' });
      if (hasSupabaseError(upsertSession)) {
        throw new Error(upsertSession.error?.message || 'Failed to upsert chatbot session');
      }

      const insertEvent = await supabaseAdmin.from('chatbot_events').insert({
        session_id: event.sessionId,
        role: event.role,
        message: event.message,
        meta: event.meta ?? {},
        created_at: createdAt,
      });
      if (hasSupabaseError(insertEvent)) {
        throw new Error(insertEvent.error?.message || 'Failed to insert chatbot event');
      }

      return { id, createdAt };
    } catch {
      // Fall back to in-memory store (dev/local without DB)
    }
  }

  const store = await loadFallbackStore();
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

  await persistFallbackStore(store);

  return { id, createdAt };
}

export async function listSessions(limit = 50, options?: ReadOptions): Promise<ChatSessionSummary[]> {
  const allowFallback = shouldFallback(options);

  if (supabaseAdmin) {
    try {
      const sessionsResult = await supabaseAdmin
        .from('chatbot_sessions')
        .select('session_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (hasSupabaseError(sessionsResult)) {
        if (!allowFallback && isMissingSupabaseTableError(sessionsResult.error?.message)) {
          throw new Error('ERR_SUPABASE_MISSING_TABLE:chatbot_sessions');
        }
        throw new Error(sessionsResult.error?.message || 'Failed to load chatbot sessions');
      }

      const data = sessionsResult.data;

      const sessions = (data ?? []).map((s) => ({
        sessionId: s.session_id as string,
        createdAt: (s.created_at as string) ?? (s.updated_at as string),
        lastAt: (s.updated_at as string) ?? (s.created_at as string),
        eventCount: 0,
        lastMessagePreview: '',
      }));

      for (const session of sessions) {
        const lastResult = await supabaseAdmin
          .from('chatbot_events')
          .select('message, created_at')
          .eq('session_id', session.sessionId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (hasSupabaseError(lastResult)) {
          if (!allowFallback && isMissingSupabaseTableError(lastResult.error?.message)) {
            throw new Error('ERR_SUPABASE_MISSING_TABLE:chatbot_events');
          }
          throw new Error(lastResult.error?.message || 'Failed to load last chatbot event');
        }

        const countResult = await supabaseAdmin
          .from('chatbot_events')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.sessionId);
        if (hasSupabaseError(countResult)) {
          if (!allowFallback && isMissingSupabaseTableError(countResult.error?.message)) {
            throw new Error('ERR_SUPABASE_MISSING_TABLE:chatbot_events');
          }
          throw new Error(countResult.error?.message || 'Failed to count chatbot events');
        }

        session.eventCount = countResult.count ?? 0;
        session.lastMessagePreview = (lastResult.data?.[0]?.message as string | undefined)?.slice(0, 120) ?? '';
      }

      return sessions;
    } catch (error) {
      if (!allowFallback) throw error;
      // fall back
    }
  }

  const store = await loadFallbackStore();
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

export async function getSessionEvents(sessionId: string, limit = 200, options?: ReadOptions): Promise<ChatEvent[]> {
  const allowFallback = shouldFallback(options);

  if (supabaseAdmin) {
    try {
      const eventsResult = await supabaseAdmin
        .from('chatbot_events')
        .select('id, session_id, role, message, meta, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);
      if (hasSupabaseError(eventsResult)) {
        if (!allowFallback && isMissingSupabaseTableError(eventsResult.error?.message)) {
          throw new Error('ERR_SUPABASE_MISSING_TABLE:chatbot_events');
        }
        throw new Error(eventsResult.error?.message || 'Failed to load chatbot events');
      }

      const data = eventsResult.data;

      return (data ?? []).map((row) => ({
        id: (row.id as string) ?? makeId(),
        sessionId: row.session_id as string,
        role: row.role as ChatRole,
        message: row.message as string,
        meta: (row.meta as Record<string, unknown> | null) ?? {},
        createdAt: row.created_at as string,
      }));
    } catch (error) {
      if (!allowFallback) throw error;
      // fall back
    }
  }

  const store = await loadFallbackStore();
  return store.sessions.get(sessionId)?.events.slice(-limit) ?? [];
}
