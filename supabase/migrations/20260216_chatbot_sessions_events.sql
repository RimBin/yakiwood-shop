-- Chatbot session/event log tables for admin conversation history

create extension if not exists pgcrypto;

create table if not exists public.chatbot_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.chatbot_sessions(session_id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chatbot_sessions_updated_at_idx
  on public.chatbot_sessions (updated_at desc);

create index if not exists chatbot_events_session_created_at_idx
  on public.chatbot_events (session_id, created_at asc);

create index if not exists chatbot_events_created_at_idx
  on public.chatbot_events (created_at desc);

create or replace function public.set_chatbot_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chatbot_sessions_updated_at on public.chatbot_sessions;
create trigger trg_chatbot_sessions_updated_at
before update on public.chatbot_sessions
for each row execute function public.set_chatbot_sessions_updated_at();

alter table public.chatbot_sessions enable row level security;
alter table public.chatbot_events enable row level security;

-- Intentionally no public policies; write/read via service role server APIs.
