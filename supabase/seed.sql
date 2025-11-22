-- Sample products data for Yakiwood shop

-- Insert products
insert into products (name, slug, description, base_price, wood_type, category, is_active) values
  (
    'Burnt Spruce Cladding',
    'burnt-spruce-cladding',
    'Premium burnt spruce wood cladding with natural texture and rich dark finish. Perfect for exterior and interior applications.',
    45.99,
    'spruce',
    'cladding',
    true
  ),
  (
    'Burnt Larch Decking',
    'burnt-larch-decking',
    'Durable burnt larch decking boards with excellent weather resistance. Ideal for outdoor decking projects.',
    52.99,
    'larch',
    'decking',
    true
  ),
  (
    'Burnt Pine Panels',
    'burnt-pine-panels',
    'Elegant burnt pine wall panels with unique grain patterns. Creates stunning accent walls.',
    38.99,
    'pine',
    'cladding',
    true
  );

-- Insert product variants (colors/finishes)
-- Variants for Burnt Spruce Cladding
insert into product_variants (product_id, name, variant_type, hex_color, price_adjustment, is_available) values
  (
    (select id from products where slug = 'burnt-spruce-cladding'),
    'Natural Burnt',
    'color',
    '#2d2419',
    0,
    true
  ),
  (
    (select id from products where slug = 'burnt-spruce-cladding'),
    'Dark Brown',
    'color',
    '#1a1410',
    5.00,
    true
  ),
  (
    (select id from products where slug = 'burnt-spruce-cladding'),
    'Black',
    'color',
    '#0a0806',
    8.00,
    true
  );

-- Variants for Burnt Larch Decking
insert into product_variants (product_id, name, variant_type, hex_color, price_adjustment, is_available) values
  (
    (select id from products where slug = 'burnt-larch-decking'),
    'Natural Burnt',
    'color',
    '#3a2f1e',
    0,
    true
  ),
  (
    (select id from products where slug = 'burnt-larch-decking'),
    'Espresso',
    'color',
    '#241a12',
    6.00,
    true
  );

-- Variants for Burnt Pine Panels
insert into product_variants (product_id, name, variant_type, hex_color, price_adjustment, is_available) values
  (
    (select id from products where slug = 'burnt-pine-panels'),
    'Natural Burnt',
    'color',
    '#332618',
    0,
    true
  ),
  (
    (select id from products where slug = 'burnt-pine-panels'),
    'Charcoal',
    'color',
    '#1c1510',
    4.00,
    true
  ),
  (
    (select id from products where slug = 'burnt-pine-panels'),
    'Midnight Black',
    'color',
    '#0d0a08',
    7.00,
    true
  );
