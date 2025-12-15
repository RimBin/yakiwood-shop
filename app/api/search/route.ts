import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types for search response
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  wood_type: string;
  category: string;
  image_url: string | null;
  is_active: boolean;
}

interface SearchResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  query: string;
}

interface ErrorResponse {
  error: string;
  code: string;
}

// Validation constants
const MAX_QUERY_LENGTH = 200;
const MIN_QUERY_LENGTH = 1;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/**
 * Search products API endpoint
 * GET /api/search?q=search+term&page=1&limit=12
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<SearchResponse | ErrorResponse>> {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = searchParams.get('q') || '';
    const query = rawQuery.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10))
    );
    const category = searchParams.get('category') || null;
    const woodType = searchParams.get('wood_type') || null;

    // Handle empty query - return empty results or all products
    if (!query) {
      // Option 1: Return empty results for empty query
      // return NextResponse.json({
      //   products: [],
      //   pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
      //   query: '',
      // });

      // Option 2: Return all active products when no search term
      return await getAllProducts(page, limit, category, woodType);
    }

    // Validate query length
    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        {
          error: `Paieškos užklausa per ilga. Maksimalus ilgis: ${MAX_QUERY_LENGTH} simboliai.`,
          code: 'QUERY_TOO_LONG',
        },
        { status: 400 }
      );
    }

    if (query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json(
        {
          error: 'Paieškos užklausa per trumpa.',
          code: 'QUERY_TOO_SHORT',
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Sanitize search query for ILIKE (escape special characters)
    const sanitizedQuery = query
      .replace(/[%_\\]/g, '\\$&') // Escape LIKE wildcards
      .toLowerCase();

    // Build search query with ILIKE for partial matching
    // Search across name, description, wood_type, and category
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .or(
        `name.ilike.%${sanitizedQuery}%,` +
        `description.ilike.%${sanitizedQuery}%,` +
        `wood_type.ilike.%${sanitizedQuery}%,` +
        `category.ilike.%${sanitizedQuery}%`
      );

    // Apply optional filters
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    if (woodType) {
      queryBuilder = queryBuilder.eq('wood_type', woodType);
    }

    // Execute query with pagination
    const { data: products, error, count } = await queryBuilder
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Search query failed:', error);
      return NextResponse.json(
        {
          error: 'Paieška nepavyko. Bandykite dar kartą.',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      query,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Vidinė serverio klaida.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Get all active products with pagination (used when no search query)
 */
async function getAllProducts(
  page: number,
  limit: number,
  category: string | null,
  woodType: string | null
): Promise<NextResponse<SearchResponse | ErrorResponse>> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let queryBuilder = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply optional filters
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }
  if (woodType) {
    queryBuilder = queryBuilder.eq('wood_type', woodType);
  }

  const { data: products, error, count } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      {
        error: 'Nepavyko gauti produktų sąrašo.',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    products: products || [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
    query: '',
  });
}

/**
 * Full-text search alternative (if you set up PostgreSQL full-text search)
 * Uncomment and use if you add a tsvector column to products table
 */
// async function fullTextSearch(
//   query: string,
//   page: number,
//   limit: number
// ): Promise<NextResponse<SearchResponse | ErrorResponse>> {
//   const supabase = await createClient();
//   const offset = (page - 1) * limit;
//
//   // Requires a generated tsvector column like:
//   // ALTER TABLE products ADD COLUMN search_vector tsvector
//   //   GENERATED ALWAYS AS (
//   //     to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
//   //   ) STORED;
//   // CREATE INDEX products_search_idx ON products USING gin(search_vector);
//
//   const { data: products, error, count } = await supabase
//     .from('products')
//     .select('*', { count: 'exact' })
//     .eq('is_active', true)
//     .textSearch('search_vector', query, {
//       type: 'websearch',
//       config: 'simple',
//     })
//     .range(offset, offset + limit - 1);
//
//   if (error) {
//     console.error('Full-text search failed:', error);
//     return NextResponse.json(
//       { error: 'Paieška nepavyko.', code: 'SEARCH_ERROR' },
//       { status: 500 }
//     );
//   }
//
//   const total = count || 0;
//   const totalPages = Math.ceil(total / limit);
//
//   return NextResponse.json({
//     products: products || [],
//     pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
//     query,
//   });
// }
