-- Create seo_overrides table for per-page SEO overrides editable from /admin/seo
-- Canonical keying strategy:
-- - canonical_path: pathname only (e.g. /products/foo or /lt/produktai/foo)
-- - locale: 'en' | 'lt'
-- NOTE: This repo uses next-intl + locale path mapping; prefer storing overrides by canonical_path.

create table if not exists public.seo_overrides (
  id uuid primary key default gen_random_uuid(),

  canonical_path text not null,
  locale text not null check (locale in ('en', 'lt')),

  enabled boolean not null default true,

  title text null,
  description text null,

  canonical_url text null,

  robots_index boolean null,
  robots_follow boolean null,

  og_title text null,
  og_description text null,
  og_image text null,

  twitter_title text null,
  twitter_description text null,
  twitter_image text null,

  updated_by uuid null,
  updated_by_email text null,
  updated_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

create unique index if not exists seo_overrides_canonical_locale_uniq
  on public.seo_overrides (canonical_path, locale);

create index if not exists seo_overrides_enabled_idx
  on public.seo_overrides (enabled);

create index if not exists seo_overrides_updated_at_idx
  on public.seo_overrides (updated_at desc);

-- Optional: keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seo_overrides_set_updated_at on public.seo_overrides;
create trigger seo_overrides_set_updated_at
before update on public.seo_overrides
for each row
execute function public.set_updated_at();

-- RLS suggestion (recommended):
-- - Allow public read (so site can apply overrides at runtime without service role).
-- - Allow writes only via server (service role) through admin API.
-- Enable and add policies if you want this behavior:
--
-- alter table public.seo_overrides enable row level security;
--
-- create policy "Public read seo_overrides"
--   on public.seo_overrides
--   for select
--   to anon, authenticated
--   using (enabled = true);
--
-- create policy "No direct writes"
--   on public.seo_overrides
--   for all
--   to anon, authenticated
--   using (false)
--   with check (false);
