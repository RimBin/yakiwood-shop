import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseSlugRaw = url.searchParams.get('baseSlug')
  const profileRaw = url.searchParams.get('profile')
  const colorRaw = url.searchParams.get('color')
  const widthMm = Number(url.searchParams.get('w'))
  const lengthMm = Number(url.searchParams.get('l'))

  if (!baseSlugRaw || !profileRaw || !colorRaw || !Number.isFinite(widthMm) || !Number.isFinite(lengthMm)) {
    return NextResponse.json(
      { error: 'Missing required query params: baseSlug, profile, color, w, l' },
      { status: 400 }
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Inventory resolution not configured' },
      { status: 501 }
    )
  }

  const baseSlug = normalizeKey(baseSlugRaw)
  const profile = normalizeKey(profileRaw)
  const color = normalizeKey(colorRaw)
  const size = `${Math.round(widthMm)}x${Math.round(lengthMm)}`

  // Stock item slug format used elsewhere in repo:
  //   <baseSlug>--<profile>--<color>--<width>x<length>
  const stockSlug = `${baseSlug}--${profile}--${color}--${size}`

  // Resolve product row first (inactive stock-item products exist in DB).
  const { data: productRow, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, slug, slug_en, is_active')
    .or(`slug.eq.${stockSlug},slug_en.eq.${stockSlug}`)
    .maybeSingle()

  if (productError) {
    return NextResponse.json(
      { error: 'Failed to resolve stock item', details: productError.message },
      { status: 500 }
    )
  }

  if (!productRow?.id) {
    return NextResponse.json({
      stockSlug,
      foundProduct: false,
      foundInventory: false,
      sku: null,
      quantityAvailable: 0,
    })
  }

  const { data: inventoryRow, error: invError } = await supabaseAdmin
    .from('inventory_items')
    .select('sku, quantity_available, quantity_reserved')
    .eq('product_id', productRow.id)
    .maybeSingle()

  if (invError) {
    return NextResponse.json(
      { error: 'Failed to load inventory', details: invError.message },
      { status: 500 }
    )
  }

  const quantityAvailable = Number(inventoryRow?.quantity_available ?? 0)
  const quantityReserved = Number(inventoryRow?.quantity_reserved ?? 0)

  return NextResponse.json({
    stockSlug,
    foundProduct: true,
    foundInventory: !!inventoryRow,
    sku: inventoryRow?.sku ?? null,
    quantityAvailable: Number.isFinite(quantityAvailable) ? quantityAvailable : 0,
    quantityReserved: Number.isFinite(quantityReserved) ? quantityReserved : 0,
  })
}
