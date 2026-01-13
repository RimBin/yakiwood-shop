-- Chatbot settings stored in Supabase (non-secret)

create table if not exists public.chatbot_settings (
  id text primary key default 'default',
  use_openai boolean not null default true,
  openai_mode text not null default 'always' check (openai_mode in ('always','fallback','off')),
  min_confidence numeric not null default 0.75,
  temperature numeric not null default 0.2,
  system_prompt_lt text,
  system_prompt_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_chatbot_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chatbot_settings_updated_at on public.chatbot_settings;
create trigger trg_chatbot_settings_updated_at
before update on public.chatbot_settings
for each row execute function public.set_chatbot_settings_updated_at();

alter table public.chatbot_settings enable row level security;

-- Intentionally no public select policy; access via server-side service role only.
