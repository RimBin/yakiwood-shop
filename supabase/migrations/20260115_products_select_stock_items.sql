-- Allow storefront to list stock-item (variation) products.
--
-- Historically we only exposed is_active=true products publicly.
-- Stock-item products are seeded as inactive but have a slug marker containing "--".
--
-- IMPORTANT: This makes those stock-item rows publicly selectable.

DROP POLICY IF EXISTS "products_select_published" ON products;

CREATE POLICY "products_select_published"
  ON products
  FOR SELECT
  USING (
    is_active = true
    OR COALESCE(slug, '') LIKE '%--%'
  );
