-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table (main product types)
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  base_price decimal(10,2) not null,
  wood_type text not null, -- 'spruce', 'larch', 'oak', etc.
  category text not null, -- 'cladding', 'decking', 'furniture', etc.
  image_url text,
  model_3d_url text, -- GLB/GLTF model URL
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product variants (colors, sizes, finishes)
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  name text not null, -- e.g., "Natural", "Dark Brown", "Black"
  variant_type text not null, -- 'color', 'size', 'finish'
  hex_color text, -- for color variants
  price_adjustment decimal(10,2) default 0, -- price difference from base
  texture_url text, -- texture image for 3D configurator
  stock_quantity integer default 0,
  sku text unique,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Custom configurations (saved 3D configurations)
create table custom_configurations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid, -- optional if user is logged in
  configuration_data jsonb not null, -- stores selected variants, dimensions, etc.
  preview_image_url text, -- screenshot of configured product
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, -- optional guest checkout
  email text not null,
  status text not null default 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  total_amount decimal(10,2) not null,
  currency text default 'EUR',
  
  -- Shipping info
  shipping_name text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  shipping_phone text,
  
  -- Payment info
  stripe_payment_id text,
  stripe_checkout_session_id text,
  payment_status text default 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  configuration_id uuid references custom_configurations(id),
  
  product_name text not null, -- snapshot at time of order
  quantity integer not null default 1,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  
  configuration_snapshot jsonb, -- full config at time of purchase
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart (for logged-in users, optional - can use local storage for guests)
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  product_id uuid references products(id) on delete cascade not null,
  configuration_id uuid references custom_configurations(id),
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index products_slug_idx on products(slug);
create index products_category_idx on products(category);
create index products_wood_type_idx on products(wood_type);
create index product_variants_product_id_idx on product_variants(product_id);
create index orders_email_idx on orders(email);
create index orders_status_idx on orders(status);
create index order_items_order_id_idx on order_items(order_id);
create index cart_items_user_id_idx on cart_items(user_id);

-- User profiles table
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Delivery addresses table
create table delivery_addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  country text not null,
  city text not null,
  street_address text not null,
  postal_code text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index delivery_addresses_user_id_idx on delivery_addresses(user_id);

-- RLS (Row Level Security) policies
alter table products enable row level security;
alter table product_variants enable row level security;
alter table custom_configurations enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart_items enable row level security;
alter table user_profiles enable row level security;
alter table delivery_addresses enable row level security;

-- Public read access for products
create policy "Products are viewable by everyone"
  on products for select
  using (is_active = true);

create policy "Product variants are viewable by everyone"
  on product_variants for select
  using (is_available = true);

-- Users can read their own orders
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() is null or email = auth.jwt()->>'email');

create policy "Users can view their own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or auth.uid() is null)
    )
  );

-- Users can manage their own cart
create policy "Users can view their own cart"
  on cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
  on cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on cart_items for delete
  using (auth.uid() = user_id);

-- Custom configurations
create policy "Users can view their own configurations"
  on custom_configurations for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can create configurations"
  on custom_configurations for insert
  with check (auth.uid() = user_id or user_id is null);

-- User profiles
create policy "Users can view their own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Triggers for updated_at
create trigger update_products_updated_at before update on products
  for each row execute procedure update_updated_at_column();

create trigger update_orders_updated_at before update on orders
  for each row execute procedure update_updated_at_column();

create trigger update_cart_items_updated_at before update on cart_items
  for each row execute procedure update_updated_at_column();

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute procedure update_updated_at_column();

create trigger update_delivery_addresses_updated_at before update on delivery_addresses
  for each row execute procedure update_updated_at_column();
create policy "Users can insert their own addresses"
  on delivery_addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
  on delivery_addresses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own addresses"
  on delivery_addresses for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_products_updated_at before update on products
  for each row execute procedure update_updated_at_column();

create trigger update_orders_updated_at before update on orders
  for each row execute procedure update_updated_at_column();

create trigger update_cart_items_updated_at before update on cart_items
  for each row execute procedure update_updated_at_column();
