-- ============================================================================
-- Migration: 20260303_cms_posts_projects.sql
-- Description: CMS tables for blog posts and projects (publish/draft) with RLS.
-- ============================================================================

-- POSTS ----------------------------------------------------------------------

create table if not exists public.cms_posts (
  id text primary key,

  slug_lt text not null default '',
  slug_en text not null default '',

  title_lt text not null default '',
  title_en text not null default '',

  excerpt_lt text not null default '',
  excerpt_en text not null default '',

  category_lt text not null default '',
  category_en text not null default '',

  hero_image text null,

  author text not null default 'Yakiwood',
  date date not null default current_date,
  read_time_minutes integer not null default 4 check (read_time_minutes >= 0),

  published boolean not null default false,
  published_at timestamptz null,

  doc jsonb not null,

  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists cms_posts_published_date_idx
  on public.cms_posts (published, date desc);

create unique index if not exists cms_posts_slug_lt_uniq
  on public.cms_posts (slug_lt)
  where slug_lt <> '';

create unique index if not exists cms_posts_slug_en_uniq
  on public.cms_posts (slug_en)
  where slug_en <> '';

drop trigger if exists cms_posts_set_updated_at on public.cms_posts;
create trigger cms_posts_set_updated_at
before update on public.cms_posts
for each row
execute function public.set_updated_at();

create or replace function public.cms_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published is true then
    if tg_op = 'INSERT' then
      new.published_at = coalesce(new.published_at, now());
    else
      if old.published is distinct from true then
        new.published_at = coalesce(new.published_at, now());
      else
        new.published_at = coalesce(new.published_at, old.published_at);
      end if;
    end if;
  else
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists cms_posts_set_published_at on public.cms_posts;
create trigger cms_posts_set_published_at
before insert or update on public.cms_posts
for each row
execute function public.cms_set_published_at();

alter table public.cms_posts enable row level security;

drop policy if exists "cms_posts_public_select_published" on public.cms_posts;
drop policy if exists "cms_posts_service_role_all" on public.cms_posts;

create policy "cms_posts_public_select_published"
  on public.cms_posts
  for select
  to anon, authenticated
  using (published = true);

create policy "cms_posts_service_role_all"
  on public.cms_posts
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');


-- PROJECTS -------------------------------------------------------------------

create table if not exists public.cms_projects (
  id text primary key,

  slug_lt text not null default '',
  slug_en text not null default '',

  title_lt text not null default '',
  title_en text not null default '',

  featured boolean not null default false,
  category text not null default 'residential',

  published boolean not null default false,
  published_at timestamptz null,

  doc jsonb not null,

  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists cms_projects_published_featured_idx
  on public.cms_projects (published, featured, updated_at desc);

create unique index if not exists cms_projects_slug_lt_uniq
  on public.cms_projects (slug_lt)
  where slug_lt <> '';

create unique index if not exists cms_projects_slug_en_uniq
  on public.cms_projects (slug_en)
  where slug_en <> '';

drop trigger if exists cms_projects_set_updated_at on public.cms_projects;
create trigger cms_projects_set_updated_at
before update on public.cms_projects
for each row
execute function public.set_updated_at();

drop trigger if exists cms_projects_set_published_at on public.cms_projects;
create trigger cms_projects_set_published_at
before insert or update on public.cms_projects
for each row
execute function public.cms_set_published_at();

alter table public.cms_projects enable row level security;

drop policy if exists "cms_projects_public_select_published" on public.cms_projects;
drop policy if exists "cms_projects_service_role_all" on public.cms_projects;

create policy "cms_projects_public_select_published"
  on public.cms_projects
  for select
  to anon, authenticated
  using (published = true);

create policy "cms_projects_service_role_all"
  on public.cms_projects
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');
