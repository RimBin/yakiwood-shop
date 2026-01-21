-- Add inventory-related fields to products.
-- Admin UI expects these; older DBs may not have them.

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;

-- Enforce uniqueness only when SKU is present.
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON products (sku) WHERE sku IS NOT NULL;
