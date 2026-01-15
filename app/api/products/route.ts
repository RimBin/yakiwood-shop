import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const mode = (url.searchParams.get('mode') ?? 'active') as 'active' | 'stock-items' | 'all'

    // Prefer service-role (bypasses RLS) when available.
    const supabase = supabaseAdmin ?? (await createClient())

    // Only expose the columns needed for storefront listing/detail.
    let query = supabase
      .from('products')
      .select(
        [
          'id',
          'name',
          'name_en',
          'slug',
          'slug_en',
          'description',
          'description_en',
          'base_price',
          'sale_price',
          'wood_type',
          'category',
          'usage_type',
          'image_url',
          'is_active',
          'product_variants(*)',
        ].join(',')
      )
      .order('created_at', { ascending: false })

    if (mode === 'active') {
      query = query.eq('is_active', true)
    } else if (mode === 'stock-items') {
      query = query.ilike('slug', '%--%')
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If we don't have service-role configured, RLS may prevent stock-items.
    if (mode === 'stock-items' && !supabaseAdmin && (!products || products.length === 0)) {
      return NextResponse.json(
        {
          error:
            'Stock-item products require SUPABASE_SERVICE_ROLE_KEY (or an updated RLS policy) to be listed.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
