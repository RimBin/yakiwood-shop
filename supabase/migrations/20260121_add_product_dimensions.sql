-- Add optional dimensions to products (millimeters)
--
-- Admin UI expects these fields; older DBs may not have them.

ALTER TABLE products ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS depth integer;
