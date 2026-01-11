-- Catalog options + product assets + sale price + thickness support

-- 1) Products: bilingual fallbacks + sale price
alter table products
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists sale_price decimal(10,2);

-- Fill missing EN fields from LT on insert (so creating in one language auto-populates the other).
create or replace function products_fill_missing_translations()
returns trigger as $$
begin
  if new.name_en is null or length(trim(new.name_en)) = 0 then
    new.name_en := new.name;
  end if;

  if new.description_en is null or length(trim(new.description_en)) = 0 then
    new.description_en := new.description;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists products_fill_missing_translations on products;
create trigger products_fill_missing_translations
before insert on products
for each row execute function products_fill_missing_translations();

-- 2) Global catalog options (wood, color, profile, width, length, thickness, finish)
create table if not exists catalog_options (
  id uuid primary key default uuid_generate_v4(),
  option_type text not null,
  value_text text,
  value_mm integer,
  label_lt text,
  label_en text,
  hex_color text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint catalog_options_option_type_check check (
    option_type in ('wood', 'color', 'profile', 'width_mm', 'length_mm', 'thickness', 'finish')
  ),
  constraint catalog_options_value_check check (
    (value_text is not null) or (value_mm is not null)
  )
);

create unique index if not exists catalog_options_unique_text_idx
  on catalog_options(option_type, lower(value_text))
  where value_text is not null;

create unique index if not exists catalog_options_unique_mm_idx
  on catalog_options(option_type, value_mm)
  where value_mm is not null;

drop trigger if exists update_catalog_options_updated_at on catalog_options;
create trigger update_catalog_options_updated_at before update on catalog_options
  for each row execute function update_updated_at_column();

alter table catalog_options enable row level security;

drop policy if exists "catalog_options_select_active" on catalog_options;
create policy "catalog_options_select_active"
  on catalog_options
  for select
  using (is_active = true);

drop policy if exists "catalog_options_admin_insert" on catalog_options;
create policy "catalog_options_admin_insert"
  on catalog_options
  for insert
  with check (is_admin());

drop policy if exists "catalog_options_admin_update" on catalog_options;
create policy "catalog_options_admin_update"
  on catalog_options
  for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "catalog_options_admin_delete" on catalog_options;
create policy "catalog_options_admin_delete"
  on catalog_options
  for delete
  using (is_admin());

-- 3) Product assets (photos now, textures/3D later) matched by parameters.
-- Use NULL selectors as wildcards.
create table if not exists product_assets (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  asset_type text not null,
  url text not null,

  -- selectors
  wood_type text,
  color_code text,
  usage_type text,
  profile_variant_id uuid references product_variants(id) on delete set null,
  finish_variant_id uuid references product_variants(id) on delete set null,

  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint product_assets_asset_type_check check (
    asset_type in ('photo', 'texture', 'gltf')
  )
);

create index if not exists product_assets_product_id_idx on product_assets(product_id);
create index if not exists product_assets_asset_type_idx on product_assets(asset_type);
create index if not exists product_assets_wood_type_idx on product_assets(wood_type);
create index if not exists product_assets_color_code_idx on product_assets(color_code);
create index if not exists product_assets_usage_type_idx on product_assets(usage_type);
create index if not exists product_assets_profile_variant_id_idx on product_assets(profile_variant_id);
create index if not exists product_assets_finish_variant_id_idx on product_assets(finish_variant_id);

drop trigger if exists update_product_assets_updated_at on product_assets;
create trigger update_product_assets_updated_at before update on product_assets
  for each row execute function update_updated_at_column();

alter table product_assets enable row level security;

drop policy if exists "product_assets_select_active" on product_assets;
create policy "product_assets_select_active"
  on product_assets
  for select
  using (is_active = true);

drop policy if exists "product_assets_admin_insert" on product_assets;
create policy "product_assets_admin_insert"
  on product_assets
  for insert
  with check (is_admin());

drop policy if exists "product_assets_admin_update" on product_assets;
create policy "product_assets_admin_update"
  on product_assets
  for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "product_assets_admin_delete" on product_assets;
create policy "product_assets_admin_delete"
  on product_assets
  for delete
  using (is_admin());

-- 4) Configuration pricing: add thickness selector
alter table product_configuration_prices
  add column if not exists thickness_option_id uuid references catalog_options(id) on delete set null;

create index if not exists product_configuration_prices_thickness_option_id_idx
  on product_configuration_prices(thickness_option_id);

-- Optional: RLS for pricing (public read, admin write)
alter table product_configuration_prices enable row level security;

drop policy if exists "product_configuration_prices_select_active" on product_configuration_prices;
create policy "product_configuration_prices_select_active"
  on product_configuration_prices
  for select
  using (is_active = true);

drop policy if exists "product_configuration_prices_admin_insert" on product_configuration_prices;
create policy "product_configuration_prices_admin_insert"
  on product_configuration_prices
  for insert
  with check (is_admin());

drop policy if exists "product_configuration_prices_admin_update" on product_configuration_prices;
create policy "product_configuration_prices_admin_update"
  on product_configuration_prices
  for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "product_configuration_prices_admin_delete" on product_configuration_prices;
create policy "product_configuration_prices_admin_delete"
  on product_configuration_prices
  for delete
  using (is_admin());
