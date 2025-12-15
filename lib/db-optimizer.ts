/**
 * Database Query Optimization
 * 
 * Implements caching, query optimization, and performance monitoring
 * for database operations using Next.js cache APIs.
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache configuration presets
 */
export const CachePresets = {
  // Static content that rarely changes (1 hour)
  STATIC: { revalidate: 3600, tags: ['static'] },
  
  // Products that change occasionally (30 minutes)
  PRODUCTS: { revalidate: 1800, tags: ['products'] },
  
  // Frequently updated content (5 minutes)
  DYNAMIC: { revalidate: 300, tags: ['dynamic'] },
  
  // User-specific data (no revalidation, only tag-based)
  USER: { revalidate: false, tags: ['user'] },
} as const;

/**
 * Generic cached query wrapper
 */
export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
) {
  return unstable_cache(
    queryFn,
    cacheKey,
    {
      revalidate: options.revalidate ?? 3600,
      tags: options.tags ?? [],
    }
  );
}

/**
 * Cached product queries
 */
export const getCachedProducts = unstable_cache(
  async () => {
    // Implement your product fetching logic
    // This is a placeholder - replace with actual Supabase/database call
    const products = await fetchProducts();
    return products;
  },
  ['products-list'],
  CachePresets.PRODUCTS
);

export const getCachedProduct = (productId: string) =>
  unstable_cache(
    async () => {
      const product = await fetchProductById(productId);
      return product;
    },
    ['product', productId],
    CachePresets.PRODUCTS
  );

export const getCachedProductsByCategory = (category: string) =>
  unstable_cache(
    async () => {
      const products = await fetchProductsByCategory(category);
      return products;
    },
    ['products-by-category', category],
    CachePresets.PRODUCTS
  );

/**
 * Query performance monitoring
 */
interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  cached: boolean;
}

const queryMetrics: QueryMetrics[] = [];

export function trackQuery(query: string, duration: number, cached: boolean = false) {
  queryMetrics.push({
    query,
    duration,
    timestamp: new Date(),
    cached,
  });

  // Keep only last 100 queries
  if (queryMetrics.length > 100) {
    queryMetrics.shift();
  }

  // Log slow queries
  if (duration > 1000 && !cached) {
    console.warn(`[Slow Query] ${query} took ${duration}ms`);
  }
}

export function getQueryMetrics() {
  const total = queryMetrics.length;
  const cached = queryMetrics.filter(m => m.cached).length;
  const avgDuration = queryMetrics.reduce((sum, m) => sum + m.duration, 0) / total;
  const slowQueries = queryMetrics.filter(m => m.duration > 1000);

  return {
    total,
    cached,
    cacheHitRate: ((cached / total) * 100).toFixed(2) + '%',
    avgDuration: Math.round(avgDuration) + 'ms',
    slowQueries: slowQueries.length,
    metrics: queryMetrics,
  };
}

/**
 * Database query wrapper with timing
 */
export async function timedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cached: boolean = false
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    trackQuery(queryName, duration, cached);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackQuery(`${queryName} (ERROR)`, duration, cached);
    throw error;
  }
}

/**
 * Batch query optimization
 * Reduces N+1 queries by batching
 */
export async function batchQuery<T, R>(
  items: T[],
  queryFn: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(queryFn));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Connection pool monitoring
 */
export interface PoolStats {
  active: number;
  idle: number;
  waiting: number;
}

// Placeholder for connection pool stats
// Implement based on your database client (Supabase, Prisma, etc.)
export function getPoolStats(): PoolStats {
  return {
    active: 0,
    idle: 0,
    waiting: 0,
  };
}

/**
 * Analyze and suggest indexes
 */
export interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
}

export async function analyzeSlowQueries(): Promise<IndexSuggestion[]> {
  const suggestions: IndexSuggestion[] = [];
  
  // Analyze query metrics for common patterns
  const slowQueries = queryMetrics.filter(m => m.duration > 500);
  
  // Example: Detect queries that would benefit from indexes
  // This is a placeholder - implement based on your actual query patterns
  if (slowQueries.some(q => q.query.includes('WHERE category'))) {
    suggestions.push({
      table: 'products',
      columns: ['category'],
      reason: 'Frequent filtering by category detected',
    });
  }
  
  if (slowQueries.some(q => q.query.includes('WHERE slug'))) {
    suggestions.push({
      table: 'products',
      columns: ['slug'],
      reason: 'Frequent lookups by slug detected',
    });
  }
  
  return suggestions;
}

/**
 * Cache invalidation helpers
 */
export async function invalidateCache(tags: string[]) {
  // Next.js 13+ cache invalidation
  // This would use revalidateTag() in a server action or API route
  console.log(`Invalidating cache for tags: ${tags.join(', ')}`);
}

export async function invalidateProductCache(productId?: string) {
  if (productId) {
    await invalidateCache(['products', `product-${productId}`]);
  } else {
    await invalidateCache(['products']);
  }
}

// Placeholder functions - replace with actual implementations
async function fetchProducts() {
  // Implement with Supabase or your database client
  return [];
}

async function fetchProductById(id: string) {
  // Implement with Supabase or your database client
  return null;
}

async function fetchProductsByCategory(category: string) {
  // Implement with Supabase or your database client
  return [];
}
