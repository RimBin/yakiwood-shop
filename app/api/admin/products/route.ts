import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

interface VariantInput {
  id?: string
  name: string
  variantType: string
  hexColor?: string
  priceAdjustment?: number
  textureUrl?: string
  stockQuantity?: number
  sku?: string
  isAvailable?: boolean
}

interface ProductInput {
  name: string
  slug?: string
  description?: string
  basePrice: number
  woodType: string
  category: string
  imageUrl?: string
  model3dUrl?: string
  isActive?: boolean
  variants?: VariantInput[]
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function validationErrors(body: ProductInput): string[] {
  const errors: string[] = []
  if (!body.name) errors.push('name is required')
  if (body.basePrice === undefined || Number.isNaN(Number(body.basePrice))) errors.push('basePrice is required')
  if (!body.woodType) errors.push('woodType is required')
  if (!body.category) errors.push('category is required')
  return errors
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = (await request.json()) as ProductInput
    const errors = validationErrors(body)

    if (errors.length) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.name)

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        description: body.description || null,
        base_price: body.basePrice,
        wood_type: body.woodType,
        category: body.category,
        image_url: body.imageUrl || null,
        model_3d_url: body.model3dUrl || null,
        is_active: body.isActive ?? true,
      })
      .select('*')
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: productError?.message || 'Failed to create product' }, { status: 500 })
    }

    let variants = []
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      const prepared = body.variants.map((variant) => ({
        id: variant.id || randomUUID(),
        product_id: product.id,
        name: variant.name,
        variant_type: variant.variantType,
        hex_color: variant.hexColor || null,
        price_adjustment: variant.priceAdjustment ?? 0,
        texture_url: variant.textureUrl || null,
        stock_quantity: variant.stockQuantity ?? 0,
        sku: variant.sku || null,
        is_available: variant.isAvailable ?? true,
      }))

      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .upsert(prepared)
        .select('*')

      if (variantError) {
        return NextResponse.json({ error: variantError.message }, { status: 500 })
      }

      variants = variantData || []
    }

    return NextResponse.json(
      {
        product: {
          ...product,
          basePrice: product.base_price,
          woodType: product.wood_type,
          model3dUrl: product.model_3d_url,
          imageUrl: product.image_url,
        },
        variants,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
