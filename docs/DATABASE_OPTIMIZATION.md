# Database Optimization Guide

Performance optimization guide for database queries, indexing, and caching strategies.

## Overview

This guide covers database performance optimization for the Yakiwood e-commerce platform using Supabase (PostgreSQL).

## Table Structure & Indexes

### Recommended Indexes

#### Products Table
```sql
-- Primary key (automatically indexed)
CREATE INDEX IF NOT EXISTS idx_products_id ON products(id);

-- Slug for product detail pages (most common query)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Status filtering (only show active products)
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING GIN (to_tsvector('lithuanian', name || ' ' || description));

-- Compound index for category + status (common filter combination)
CREATE INDEX IF NOT EXISTS idx_products_category_status 
ON products(category, status);

-- Created date for sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
```

#### Product Variants Table
```sql
-- Primary key
CREATE INDEX IF NOT EXISTS idx_variants_id ON variants(id);

-- Foreign key to products (for JOINs)
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);

-- SKU for inventory lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);

-- Stock level queries
CREATE INDEX IF NOT EXISTS idx_variants_stock ON variants(stock_quantity);
```

#### Orders Table
```sql
-- Primary key
CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id);

-- User's order history
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Compound index for user + status
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

-- Stripe payment tracking
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session 
ON orders(stripe_session_id);
```

#### Order Items Table
```sql
-- Foreign keys for JOINs
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Compound index for order details queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_variant 
ON order_items(order_id, variant_id);
```

#### Cart Items Table
```sql
-- Session/user cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Cleanup old carts
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);
```

### Check Existing Indexes

```sql
-- List all indexes on a table
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'products';

-- Check index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM
    pg_stat_user_indexes
WHERE
    tablename = 'products'
ORDER BY
    idx_scan DESC;
```

## Query Optimization

### 1. Product List Query

**Before (Slow):**
```sql
-- No filtering, fetches all columns
SELECT * FROM products;
```

**After (Optimized):**
```sql
-- Filter by status, only select needed columns, use index
SELECT 
    id,
    name,
    slug,
    base_price,
    images[1] as primary_image
FROM 
    products
WHERE 
    status = 'active'
ORDER BY 
    created_at DESC
LIMIT 20 OFFSET 0;
```

### 2. Product Detail Query

**Before (Multiple Queries - N+1):**
```sql
-- Query 1: Get product
SELECT * FROM products WHERE slug = 'burnt-wood-plank';

-- Query 2: Get variants (separate query per product)
SELECT * FROM variants WHERE product_id = '...';
```

**After (Optimized Join):**
```sql
-- Single query with JOIN
SELECT 
    p.*,
    json_agg(v.*) as variants
FROM 
    products p
LEFT JOIN 
    variants v ON p.id = v.product_id
WHERE 
    p.slug = 'burnt-wood-plank'
    AND p.status = 'active'
GROUP BY 
    p.id;
```

### 3. Category Filter Query

**Before:**
```sql
SELECT * FROM products WHERE category = 'planks';
```

**After:**
```sql
-- Use index, filter status, select only needed columns
SELECT 
    id,
    name,
    slug,
    base_price,
    category,
    images[1] as primary_image
FROM 
    products
WHERE 
    category = 'planks'
    AND status = 'active'
ORDER BY 
    created_at DESC
LIMIT 20;
```

### 4. Order History Query

**Before (N+1 Problem):**
```sql
-- Query 1: Get orders
SELECT * FROM orders WHERE user_id = 'user123';

-- Query 2-N: Get items for each order
SELECT * FROM order_items WHERE order_id = 'order1';
SELECT * FROM order_items WHERE order_id = 'order2';
-- ...
```

**After (Optimized):**
```sql
-- Single query with subquery or JOIN
SELECT 
    o.*,
    (
        SELECT json_agg(
            json_build_object(
                'id', oi.id,
                'quantity', oi.quantity,
                'price', oi.price,
                'product_name', p.name,
                'product_image', p.images[1]
            )
        )
        FROM order_items oi
        LEFT JOIN variants v ON oi.variant_id = v.id
        LEFT JOIN products p ON v.product_id = p.id
        WHERE oi.order_id = o.id
    ) as items
FROM 
    orders o
WHERE 
    o.user_id = 'user123'
ORDER BY 
    o.created_at DESC
LIMIT 10;
```

### 5. Full-Text Search

**Implementation:**
```sql
-- Create full-text search index (already in indexes section)
CREATE INDEX idx_products_search 
ON products USING GIN (to_tsvector('lithuanian', name || ' ' || description));

-- Search query
SELECT 
    id,
    name,
    slug,
    ts_rank(
        to_tsvector('lithuanian', name || ' ' || description),
        to_tsquery('lithuanian', 'mediena')
    ) as rank
FROM 
    products
WHERE 
    to_tsvector('lithuanian', name || ' ' || description) @@ 
    to_tsquery('lithuanian', 'mediena')
    AND status = 'active'
ORDER BY 
    rank DESC
LIMIT 20;
```

## Query Result Caching

### Next.js Cache Implementation

See [`lib/db-optimizer.ts`](../lib/db-optimizer.ts) for full implementation.

**Example Usage:**
```typescript
import { getCachedProducts, getCachedProduct } from '@/lib/db-optimizer';

// In your page or server component
export default async function ProductsPage() {
  // Results cached for 30 minutes
  const products = await getCachedProducts();
  
  return <ProductGrid products={products} />;
}
```

### Cache Configuration

```typescript
// Short cache (5 minutes) - frequently updated
{ revalidate: 300, tags: ['dynamic'] }

// Medium cache (30 minutes) - products
{ revalidate: 1800, tags: ['products'] }

// Long cache (1 hour) - static content
{ revalidate: 3600, tags: ['static'] }

// No time-based revalidation, only tag-based
{ revalidate: false, tags: ['user'] }
```

### Cache Invalidation

```typescript
// In a Server Action or API route
import { revalidateTag } from 'next/cache';

export async function updateProduct(productId: string) {
  // Update product in database
  await updateProductInDB(productId);
  
  // Invalidate cache
  revalidateTag('products');
  revalidateTag(`product-${productId}`);
}
```

## Connection Pooling

### Supabase Configuration

Supabase automatically handles connection pooling. Recommended settings:

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'yakiwood',
      },
    },
  }
);
```

### Pool Monitoring

```sql
-- Check active connections
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle
FROM 
    pg_stat_activity
WHERE 
    datname = 'postgres';
```

## Slow Query Analysis

### Enable Slow Query Logging

In Supabase dashboard:
1. Go to Database → Settings
2. Enable "Log slow queries"
3. Set threshold to 500ms

### Find Slow Queries

```sql
-- Most time-consuming queries
SELECT 
    query,
    calls,
    total_time / 1000 as total_seconds,
    mean_time / 1000 as avg_seconds,
    max_time / 1000 as max_seconds
FROM 
    pg_stat_statements
ORDER BY 
    total_time DESC
LIMIT 10;
```

### Analyze Query Plan

```sql
-- Use EXPLAIN ANALYZE to see query execution plan
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE category = 'planks' 
AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;
```

## Performance Monitoring

### Query Metrics Tracking

See [`lib/db-optimizer.ts`](../lib/db-optimizer.ts) for implementation.

```typescript
import { timedQuery, getQueryMetrics } from '@/lib/db-optimizer';

// Wrap queries to track performance
const products = await timedQuery(
  'fetch-products',
  () => fetchProducts()
);

// Get metrics
const metrics = getQueryMetrics();
console.log(metrics);
// {
//   total: 50,
//   cached: 35,
//   cacheHitRate: '70%',
//   avgDuration: '125ms',
//   slowQueries: 2
// }
```

## Optimization Checklist

### Indexes
- [ ] All foreign keys indexed
- [ ] Common filter columns indexed
- [ ] Slug columns indexed (unique)
- [ ] Full-text search indexes created
- [ ] Compound indexes for common filter combinations
- [ ] Unused indexes removed

### Queries
- [ ] Only select needed columns (not SELECT *)
- [ ] Use WHERE clauses to filter data
- [ ] Implement pagination (LIMIT/OFFSET)
- [ ] Eliminate N+1 queries
- [ ] Use JOINs instead of multiple queries
- [ ] Batch queries where possible

### Caching
- [ ] Query results cached appropriately
- [ ] Cache invalidation strategy implemented
- [ ] Cache hit rate > 70%
- [ ] Stale-while-revalidate for better UX

### Monitoring
- [ ] Slow query logging enabled
- [ ] Query metrics tracked
- [ ] Database CPU usage monitored
- [ ] Connection pool monitored
- [ ] Regular performance audits scheduled

## Maintenance Tasks

### Weekly
```sql
-- Analyze table statistics
ANALYZE products;
ANALYZE variants;
ANALYZE orders;

-- Vacuum tables (reclaim space)
VACUUM ANALYZE products;
```

### Monthly
```sql
-- Check for bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM
    pg_tables
WHERE
    schemaname = 'public'
ORDER BY
    pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Review unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM
    pg_stat_user_indexes
WHERE
    idx_scan = 0
    AND indexname NOT LIKE '%_pkey';
```

## Resources

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/postgres/query-performance)
- [Next.js Data Caching](https://nextjs.org/docs/app/building-your-application/caching)
