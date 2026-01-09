import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'
import { slugify } from '@/lib/slugify'

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

type RouteParams = { id: string }
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> }

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { supabase } = await requireAdmin(request)
    const { id } = await resolveParams(context)

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        basePrice: product.base_price,
        woodType: product.wood_type,
        usageType: product.usage_type,
        model3dUrl: product.model_3d_url,
        imageUrl: product.image_url,
      },
    })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await request.json()
    const { id } = await resolveParams(context)

    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.slug !== undefined) updates.slug = slugify(body.slug || body.name || '')
    if (body.description !== undefined) updates.description = body.description
    if (body.basePrice !== undefined) updates.base_price = body.basePrice
    if (body.woodType !== undefined) updates.wood_type = body.woodType
    if (body.category !== undefined) updates.category = body.category
    if (body.usageType !== undefined) updates.usage_type = body.usageType
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl
    if (body.model3dUrl !== undefined) updates.model_3d_url = body.model3dUrl
    if (body.isActive !== undefined) updates.is_active = body.isActive

    if (Object.keys(updates).length > 0) {
      const { error: productError } = await supabase.from('products').update(updates).eq('id', id)
      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 })
      }
    }

    if (Array.isArray(body.variants)) {
      const prepared: VariantInput[] = body.variants
      const mapped = prepared.map((variant) => ({
        id: variant.id || randomUUID(),
        product_id: id,
        name: variant.name,
        variant_type: variant.variantType,
        hex_color: variant.hexColor || null,
        price_adjustment: variant.priceAdjustment ?? 0,
        texture_url: variant.textureUrl || null,
        stock_quantity: variant.stockQuantity ?? 0,
        sku: variant.sku || null,
        is_available: variant.isAvailable ?? true,
      }))

      const { error: variantError } = await supabase.from('product_variants').upsert(mapped)
      if (variantError) {
        return NextResponse.json({ error: variantError.message }, { status: 500 })
      }
    }

    const { data: refreshed, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !refreshed) {
      return NextResponse.json({ error: fetchError?.message || 'Updated product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...refreshed,
        basePrice: refreshed.base_price,
        woodType: refreshed.wood_type,
        usageType: refreshed.usage_type,
        model3dUrl: refreshed.model_3d_url,
        imageUrl: refreshed.image_url,
      },
    })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await request.json()
    const { id } = await resolveParams(context)

    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.name_en !== undefined) updates.name_en = body.name_en
    if (body.slug !== undefined) updates.slug = slugify(body.slug || body.name || '')
    if (body.description !== undefined) updates.description = body.description
    if (body.description_en !== undefined) updates.description_en = body.description_en
    if (body.base_price !== undefined) updates.base_price = body.base_price
    if (body.wood_type !== undefined) updates.wood_type = body.wood_type
    if (body.category !== undefined) updates.category = body.category
    if (body.usage_type !== undefined) updates.usage_type = body.usage_type
    if (body.image !== undefined) updates.image = body.image
    if (body.is_active !== undefined) updates.is_active = body.is_active
    if (body.stock_quantity !== undefined) updates.stock_quantity = body.stock_quantity
    if (body.sku !== undefined) updates.sku = body.sku
    if (body.width !== undefined) updates.width = body.width
    if (body.height !== undefined) updates.height = body.height
    if (body.depth !== undefined) updates.depth = body.depth
    if (body.weight !== undefined) updates.weight = body.weight

    if (Object.keys(updates).length > 0) {
      const { error: productError } = await supabase.from('products').update(updates).eq('id', id)
      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 })
      }
    }

    // Handle variants if provided
    if (body.variants && Array.isArray(body.variants)) {
      // Get existing variants
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id)

      const existingIds = existingVariants?.map((v: any) => v.id) || []
      const incomingIds = body.variants.map((v: any) => v.id).filter(Boolean)

      // Delete removed variants
      const deletedIds = existingIds.filter((eid: string) => !incomingIds.includes(eid))
      if (deletedIds.length > 0) {
        await supabase.from('product_variants').delete().in('id', deletedIds)
      }

      // Update or insert variants
      for (const variant of body.variants) {
        const variantData = {
          product_id: id,
          name: variant.name,
          variant_type: variant.variant_type,
          hex_color: variant.hex_color || null,
          price_adjustment: variant.price_adjustment || 0,
          description: variant.description || null,
          is_available: variant.is_available ?? true,
        }

        if (variant.id) {
          await supabase.from('product_variants').update(variantData).eq('id', variant.id)
        } else {
          await supabase.from('product_variants').insert(variantData)
        }
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { supabase } = await requireAdmin(request)
    const { id } = await resolveParams(context)

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Product archived successfully' })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
