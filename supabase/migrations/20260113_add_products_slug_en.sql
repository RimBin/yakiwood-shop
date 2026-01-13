-- Add English slug for products so EN and LT can have separate URLs

alter table products
  add column if not exists slug_en text;

-- Backfill: if slug_en is missing, default to existing slug
update products
set slug_en = slug
where slug_en is null;

-- Ensure uniqueness for EN slugs when provided
create unique index if not exists products_slug_en_unique_idx
  on products (slug_en)
  where slug_en is not null;

create index if not exists products_slug_en_idx
  on products (slug_en);
