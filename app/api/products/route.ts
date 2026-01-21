import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const mode = (url.searchParams.get('mode') ?? 'active') as 'active' | 'stock-items' | 'all'

    // Prefer service-role (bypasses RLS) when available.
    const supabase = supabaseAdmin ?? (await createClient())

    const fullColumns = [
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
    ]

    const fallbackColumns = [
      'id',
      'name',
      'slug',
      'description',
      'base_price',
      'wood_type',
      'category',
      'image_url',
      'is_active',
      'product_variants(*)',
    ]

    const buildQuery = (columns: string[]) => {
      let query = supabase
        .from('products')
        .select(columns.join(','))
        .order('created_at', { ascending: false })

      if (mode === 'active') {
        query = query.eq('is_active', true)
      } else if (mode === 'stock-items') {
        query = query.ilike('slug', '%--%')
      }

      return query
    }

    let { data: products, error } = await buildQuery(fullColumns)

    if (error) {
      const message = String((error as { message?: string })?.message || error)
      if (/slug_en|name_en|description_en|sale_price|usage_type|schema cache|does not exist/i.test(message)) {
        const retry = await buildQuery(fallbackColumns)
        products = retry.data
        error = retry.error
      }
    }

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

    const list = products || []

    if (mode === 'stock-items' && list.length > 0) {
      // Stock items are stored as separate product rows with slug pattern:
      // <baseSlug>--<profile>--<color>--<width>x<length>
      // Hide stock items whose base product is not active.
      const baseSlugs = Array.from(
        new Set(
          list
            .map((p: any) => String(p?.slug || ''))
            .filter(Boolean)
            .map((slug: string) => slug.split('--')[0])
            .filter((base: string) => base && !base.includes('--'))
        )
      )

      if (baseSlugs.length > 0) {
        const { data: activeBases } = await supabase
          .from('products')
          .select('slug')
          .in('slug', baseSlugs)
          .eq('is_active', true)

        const allowed = new Set((activeBases || []).map((row: any) => String(row?.slug || '')).filter(Boolean))

        const filtered = list.filter((p: any) => {
          const slug = String(p?.slug || '')
          const base = slug.split('--')[0]
          if (!base) return false
          return allowed.has(base)
        })

        return NextResponse.json(filtered)
      }
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
