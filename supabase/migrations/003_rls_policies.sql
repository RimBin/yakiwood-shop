-- ============================================================================
-- Migration: 003_rls_policies.sql
-- Description: Comprehensive Row Level Security (RLS) policies for Yakiwood
-- Created: 2024-12-15
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if the current user is an admin
-- Uses a hardcoded list of admin emails for simplicity
-- In production, consider using a roles table or Supabase custom claims
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) IN ('admin@yakiwood.lt', 'rimvydas@yakiwood.lt');
END;
$$;

COMMENT ON FUNCTION is_admin() IS 'Checks if the current authenticated user is an admin based on email whitelist';

-- Function to get current user's email from JWT
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
  RETURN auth.jwt()->>'email';
END;
$$;

COMMENT ON FUNCTION get_user_email() IS 'Extracts email from the current JWT token';

-- ============================================================================
-- DROP EXISTING POLICIES (to allow re-running this migration)
-- ============================================================================

-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "products_select_published" ON products;
DROP POLICY IF EXISTS "products_admin_insert" ON products;
DROP POLICY IF EXISTS "products_admin_update" ON products;
DROP POLICY IF EXISTS "products_admin_delete" ON products;

-- Product variants
DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "product_variants_select_available" ON product_variants;
DROP POLICY IF EXISTS "product_variants_admin_insert" ON product_variants;
DROP POLICY IF EXISTS "product_variants_admin_update" ON product_variants;
DROP POLICY IF EXISTS "product_variants_admin_delete" ON product_variants;

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;

-- Order items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;

-- Cart items
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_own" ON cart_items;

-- User profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_update" ON user_profiles;

-- Delivery addresses
DROP POLICY IF EXISTS "Users can insert their own addresses" ON delivery_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON delivery_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON delivery_addresses;
DROP POLICY IF EXISTS "delivery_addresses_select_own" ON delivery_addresses;
DROP POLICY IF EXISTS "delivery_addresses_insert_own" ON delivery_addresses;
DROP POLICY IF EXISTS "delivery_addresses_update_own" ON delivery_addresses;
DROP POLICY IF EXISTS "delivery_addresses_delete_own" ON delivery_addresses;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PRODUCTS TABLE POLICIES
-- ============================================================================
-- Products are the core catalog items. Anyone can view published/active products,
-- but only admins can manage them.

-- SELECT: Anyone (including anonymous users) can view active products
CREATE POLICY "products_select_published"
  ON products
  FOR SELECT
  USING (is_active = true);

COMMENT ON POLICY "products_select_published" ON products IS 
  'Allow anyone to view active/published products';

-- INSERT: Only authenticated admins can create products
CREATE POLICY "products_admin_insert"
  ON products
  FOR INSERT
  WITH CHECK (is_admin());

COMMENT ON POLICY "products_admin_insert" ON products IS 
  'Only admins can create new products';

-- UPDATE: Only authenticated admins can update products
CREATE POLICY "products_admin_update"
  ON products
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY "products_admin_update" ON products IS 
  'Only admins can update products';

-- DELETE: Only authenticated admins can delete products
CREATE POLICY "products_admin_delete"
  ON products
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "products_admin_delete" ON products IS 
  'Only admins can delete products';

-- ============================================================================
-- 2. PRODUCT VARIANTS TABLE POLICIES
-- ============================================================================
-- Product variants (colors, sizes, finishes) follow similar rules to products

-- SELECT: Anyone can view available variants
CREATE POLICY "product_variants_select_available"
  ON product_variants
  FOR SELECT
  USING (is_available = true);

COMMENT ON POLICY "product_variants_select_available" ON product_variants IS 
  'Allow anyone to view available product variants';

-- INSERT: Only admins can create variants
CREATE POLICY "product_variants_admin_insert"
  ON product_variants
  FOR INSERT
  WITH CHECK (is_admin());

COMMENT ON POLICY "product_variants_admin_insert" ON product_variants IS 
  'Only admins can create product variants';

-- UPDATE: Only admins can update variants
CREATE POLICY "product_variants_admin_update"
  ON product_variants
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY "product_variants_admin_update" ON product_variants IS 
  'Only admins can update product variants';

-- DELETE: Only admins can delete variants
CREATE POLICY "product_variants_admin_delete"
  ON product_variants
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "product_variants_admin_delete" ON product_variants IS 
  'Only admins can delete product variants';

-- ============================================================================
-- 3. ORDERS TABLE POLICIES
-- ============================================================================
-- Users can view and create their own orders. Only admins can update order status.
-- No one can delete orders (for audit trail purposes).

-- SELECT: Users can view their own orders (by user_id or email match)
CREATE POLICY "orders_select_own"
  ON orders
  FOR SELECT
  USING (
    -- Match by user_id for authenticated users
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Match by email (for guest orders or email lookup)
    (auth.uid() IS NOT NULL AND email = get_user_email())
    OR
    -- Admins can view all orders
    is_admin()
  );

COMMENT ON POLICY "orders_select_own" ON orders IS 
  'Users can view their own orders by user_id or email. Admins can view all orders.';

-- INSERT: Authenticated users can create orders for themselves
CREATE POLICY "orders_insert_own"
  ON orders
  FOR INSERT
  WITH CHECK (
    -- User must be authenticated and order is for themselves, OR
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );

COMMENT ON POLICY "orders_insert_own" ON orders IS 
  'Authenticated users can create orders for themselves';

-- UPDATE: Only admins can update orders (e.g., change status)
CREATE POLICY "orders_admin_update"
  ON orders
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY "orders_admin_update" ON orders IS 
  'Only admins can update order status and details';

-- NOTE: No DELETE policy - orders cannot be deleted for audit purposes

-- ============================================================================
-- 4. ORDER ITEMS TABLE POLICIES
-- ============================================================================
-- Users can view items from their own orders and insert items when creating orders.
-- No UPDATE or DELETE allowed to maintain order integrity.

-- SELECT: Users can view items from their own orders
CREATE POLICY "order_items_select_own"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR orders.email = get_user_email()
        OR is_admin()
      )
    )
  );

COMMENT ON POLICY "order_items_select_own" ON order_items IS 
  'Users can view items from their own orders. Admins can view all.';

-- INSERT: Users can insert items for their own orders
CREATE POLICY "order_items_insert_own"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

COMMENT ON POLICY "order_items_insert_own" ON order_items IS 
  'Users can add items to their own orders';

-- NOTE: No UPDATE or DELETE policies - order items are immutable

-- ============================================================================
-- 5. CART ITEMS TABLE POLICIES
-- ============================================================================
-- Users can fully manage their own cart items.
-- For anonymous users, we support session_id-based carts.

-- First, add session_id column if it doesn't exist (for anonymous carts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN session_id uuid;
    ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;
    CREATE INDEX IF NOT EXISTS cart_items_session_id_idx ON cart_items(session_id);
    COMMENT ON COLUMN cart_items.session_id IS 'Session ID for anonymous user carts';
  END IF;
END $$;

-- Add constraint to ensure either user_id or session_id is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_user_or_session'
  ) THEN
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_or_session
      CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);
  END IF;
END $$;

-- SELECT: Users can view their own cart (by user_id or session_id)
CREATE POLICY "cart_items_select_own"
  ON cart_items
  FOR SELECT
  USING (
    -- Authenticated user's cart
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Anonymous cart via session_id (session_id passed via RLS context or header)
    -- For anonymous users, the session_id check happens at application level
    -- Here we allow if user_id is null and the row exists (app handles session matching)
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

COMMENT ON POLICY "cart_items_select_own" ON cart_items IS 
  'Users can view their own cart items (authenticated or anonymous via session)';

-- INSERT: Users can add items to their own cart
CREATE POLICY "cart_items_insert_own"
  ON cart_items
  FOR INSERT
  WITH CHECK (
    -- Authenticated users can insert for themselves
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Anonymous users can insert with session_id
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

COMMENT ON POLICY "cart_items_insert_own" ON cart_items IS 
  'Users can add items to their own cart';

-- UPDATE: Users can update their own cart items
CREATE POLICY "cart_items_update_own"
  ON cart_items
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

COMMENT ON POLICY "cart_items_update_own" ON cart_items IS 
  'Users can update their own cart items (quantity, etc.)';

-- DELETE: Users can remove items from their own cart
CREATE POLICY "cart_items_delete_own"
  ON cart_items
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

COMMENT ON POLICY "cart_items_delete_own" ON cart_items IS 
  'Users can remove items from their own cart';

-- ============================================================================
-- 6. USER PROFILES TABLE POLICIES
-- ============================================================================
-- Users can view and update their own profile, and create it on signup.

-- SELECT: Users can view their own profile
CREATE POLICY "user_profiles_select_own"
  ON user_profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    is_admin()
  );

COMMENT ON POLICY "user_profiles_select_own" ON user_profiles IS 
  'Users can view their own profile. Admins can view all profiles.';

-- INSERT: Users can create their own profile on signup
CREATE POLICY "user_profiles_insert_own"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "user_profiles_insert_own" ON user_profiles IS 
  'Users can create their own profile (typically on signup)';

-- UPDATE: Users can update their own profile
CREATE POLICY "user_profiles_update_own"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "user_profiles_update_own" ON user_profiles IS 
  'Users can update their own profile but cannot change their role';

-- UPDATE: Admins can update any profile (including role changes)
CREATE POLICY "user_profiles_admin_update"
  ON user_profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY "user_profiles_admin_update" ON user_profiles IS 
  'Admins can update any user profile, including role changes';

-- Enforce role immutability for non-admin updates (RLS cannot reference OLD.*)
CREATE OR REPLACE FUNCTION user_profiles_enforce_role_change_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT is_admin() THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_enforce_role_change_admin_only ON user_profiles;
CREATE TRIGGER user_profiles_enforce_role_change_admin_only
  BEFORE UPDATE OF role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION user_profiles_enforce_role_change_admin_only();

-- ============================================================================
-- 7. DELIVERY ADDRESSES TABLE POLICIES
-- ============================================================================
-- Users have full CRUD access to their own delivery addresses.

-- SELECT: Users can view their own addresses
CREATE POLICY "delivery_addresses_select_own"
  ON delivery_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON POLICY "delivery_addresses_select_own" ON delivery_addresses IS 
  'Users can view their own delivery addresses';

-- INSERT: Users can add new addresses
CREATE POLICY "delivery_addresses_insert_own"
  ON delivery_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "delivery_addresses_insert_own" ON delivery_addresses IS 
  'Users can add new delivery addresses';

-- UPDATE: Users can update their own addresses
CREATE POLICY "delivery_addresses_update_own"
  ON delivery_addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "delivery_addresses_update_own" ON delivery_addresses IS 
  'Users can update their own delivery addresses';

-- DELETE: Users can delete their own addresses
CREATE POLICY "delivery_addresses_delete_own"
  ON delivery_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON POLICY "delivery_addresses_delete_own" ON delivery_addresses IS 
  'Users can delete their own delivery addresses';

-- ============================================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================================

-- Grant necessary permissions to authenticated and anonymous roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Products: public read, admin write
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- Product variants: public read, admin write
GRANT SELECT ON product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON product_variants TO authenticated;

-- Orders: authenticated only
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT UPDATE ON orders TO authenticated;

-- Order items: authenticated only
GRANT SELECT, INSERT ON order_items TO authenticated;

-- Cart items: both anon and authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO anon, authenticated;

-- User profiles: authenticated only
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- Delivery addresses: authenticated only
GRANT SELECT, INSERT, UPDATE, DELETE ON delivery_addresses TO authenticated;

-- ============================================================================
-- SUMMARY OF RLS POLICIES
-- ============================================================================
/*
TABLE               | SELECT           | INSERT          | UPDATE          | DELETE
--------------------+------------------+-----------------+-----------------+----------------
products            | Anyone (active)  | Admin only      | Admin only      | Admin only
product_variants    | Anyone (avail)   | Admin only      | Admin only      | Admin only
orders              | Own + Admin      | Own             | Admin only      | None
order_items         | Own + Admin      | Own orders      | None            | None
cart_items          | Own (user/sess)  | Own             | Own             | Own
user_profiles       | Own + Admin      | Own (signup)    | Own (no role)   | None
delivery_addresses  | Own              | Own             | Own             | Own
*/
