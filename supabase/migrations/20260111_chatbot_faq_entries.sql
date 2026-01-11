-- Chatbot FAQ entries (LT/EN) stored in Supabase

create table if not exists public.chatbot_faq_entries (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  locale text not null check (locale in ('lt','en')),
  enabled boolean not null default true,
  sort_order int not null default 100,
  question text not null,
  answer text not null,
  keywords text[] not null default '{}'::text[],
  suggestions text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists chatbot_faq_entries_locale_source_key_unique
  on public.chatbot_faq_entries (locale, source_key)
  where source_key is not null;

create index if not exists chatbot_faq_entries_locale_enabled_order_idx
  on public.chatbot_faq_entries (locale, enabled, sort_order);

create index if not exists chatbot_faq_entries_updated_at_idx
  on public.chatbot_faq_entries (updated_at);

-- updated_at trigger (scoped to this table to avoid name collisions)
create or replace function public.set_chatbot_faq_entries_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chatbot_faq_entries_updated_at on public.chatbot_faq_entries;
create trigger trg_chatbot_faq_entries_updated_at
before update on public.chatbot_faq_entries
for each row execute function public.set_chatbot_faq_entries_updated_at();

alter table public.chatbot_faq_entries enable row level security;

-- Allow anonymous/public reads only for enabled entries.
drop policy if exists "chatbot faq public read" on public.chatbot_faq_entries;
create policy "chatbot faq public read"
  on public.chatbot_faq_entries
  for select
  using (enabled = true);
