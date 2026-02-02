-- Email templates storage (admin editable)
create table if not exists public.email_templates (
  template_id text primary key,
  subject_lt text,
  subject_en text,
  html_lt text,
  html_en text,
  updated_at timestamptz not null default now()
);

create index if not exists email_templates_updated_at_idx
  on public.email_templates (updated_at desc);

-- Keep updated_at current
create trigger email_templates_set_updated_at
before update on public.email_templates
for each row execute function public.set_updated_at();
