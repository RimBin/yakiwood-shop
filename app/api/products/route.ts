import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = new URL(request.url).searchParams
    const category = searchParams.get('category')
    const woodType = searchParams.get('woodType')
    const q = searchParams.get('q')
    const limit = Math.min(toNumber(searchParams.get('limit'), 50), 100)
    const offset = toNumber(searchParams.get('offset'), 0)

    let query = supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        description,
        base_price,
        wood_type,
        category,
        image_url,
        model_3d_url,
        is_active,
        created_at
      `
      )
      .eq('is_active', true)

    if (category) query = query.eq('category', category)
    if (woodType) query = query.eq('wood_type', woodType)
    if (q) query = query.ilike('name', `%${q}%`)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        basePrice: item.base_price,
        woodType: item.wood_type,
        category: item.category,
        imageUrl: item.image_url,
        model3dUrl: item.model_3d_url,
        isActive: item.is_active,
      })) || []

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load products' }, { status: 500 })
  }
}
