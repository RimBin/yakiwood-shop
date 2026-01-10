-- Configuration pricing (EUR/m²) + 3D model mapping + bilingual variant labels

-- Pricing table: supports wildcard matching via NULL selectors.
create table if not exists product_configuration_prices (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  usage_type text,
  profile_variant_id uuid references product_variants(id) on delete set null,
  color_variant_id uuid references product_variants(id) on delete set null,
  width_mm integer,
  length_mm integer,
  unit_price_per_m2 decimal(10,2) not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists product_configuration_prices_product_id_idx on product_configuration_prices(product_id);
create index if not exists product_configuration_prices_usage_type_idx on product_configuration_prices(usage_type);
create index if not exists product_configuration_prices_profile_variant_id_idx on product_configuration_prices(profile_variant_id);
create index if not exists product_configuration_prices_color_variant_id_idx on product_configuration_prices(color_variant_id);
create index if not exists product_configuration_prices_width_mm_idx on product_configuration_prices(width_mm);
create index if not exists product_configuration_prices_length_mm_idx on product_configuration_prices(length_mm);

-- 3D model mapping by usage + profile.
create table if not exists product_3d_models (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  usage_type text not null,
  profile_variant_id uuid references product_variants(id) on delete cascade not null,
  model_url text not null,
  preview_image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists product_3d_models_unique_active_idx
  on product_3d_models(product_id, usage_type, profile_variant_id)
  where is_active = true;

-- Add bilingual labels + optional numeric value and separate image url.
alter table product_variants
  add column if not exists label_lt text,
  add column if not exists label_en text,
  add column if not exists value_mm integer,
  add column if not exists image_url text;

-- Keep legacy texture_url; for colors we will prefer image_url for the photo and texture_url for future 3D textures.

-- Role-based discounts (for logged-in users)
-- Supports either percent discount (0-100) or fixed discount in EUR (>=0).
create table if not exists role_discounts (
  role text primary key,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value decimal(10,2) not null default 0,
  currency text not null default 'EUR',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint role_discounts_percent_range check (
    (discount_type <> 'percent')
    or (discount_value >= 0 and discount_value <= 100)
  ),
  constraint role_discounts_fixed_range check (
    (discount_type <> 'fixed')
    or (discount_value >= 0)
  )
);

drop trigger if exists update_role_discounts_updated_at on role_discounts;
create trigger update_role_discounts_updated_at before update on role_discounts
  for each row execute function update_updated_at_column();

alter table role_discounts enable row level security;

-- Authenticated users can read discounts (used to compute effective price client-side).
drop policy if exists "role_discounts_select_authenticated" on role_discounts;
create policy "role_discounts_select_authenticated"
  on role_discounts
  for select
  using (auth.uid() is not null);

-- Admin-only write policies (also ok with service role bypass).
drop policy if exists "role_discounts_admin_insert" on role_discounts;
create policy "role_discounts_admin_insert"
  on role_discounts
  for insert
  with check (is_admin());

drop policy if exists "role_discounts_admin_update" on role_discounts;
create policy "role_discounts_admin_update"
  on role_discounts
  for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "role_discounts_admin_delete" on role_discounts;
create policy "role_discounts_admin_delete"
  on role_discounts
  for delete
  using (is_admin());
