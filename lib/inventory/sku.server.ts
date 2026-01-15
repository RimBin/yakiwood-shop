import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildInventorySku } from '@/lib/inventory/sku'

type DbProduct = {
  id: string
  wood_type: string | null
  usage_type?: string | null
}

type DbVariant = {
  id: string
  name: string
  variant_type: string | null
  label_lt?: string | null
  label_en?: string | null
}

export type InventorySkuResolveContext = {
  productsById: Map<string, DbProduct>
  variantsById: Map<string, DbVariant>
}

export function createInventorySkuResolveContext(): InventorySkuResolveContext {
  return {
    productsById: new Map(),
    variantsById: new Map(),
  }
}

async function loadProduct(productId: string, ctx: InventorySkuResolveContext): Promise<DbProduct | null> {
  const cached = ctx.productsById.get(productId)
  if (cached) return cached
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, wood_type, usage_type')
    .eq('id', productId)
    .maybeSingle()

  if (error || !data) return null
  const row = data as unknown as DbProduct
  ctx.productsById.set(productId, row)
  return row
}

async function loadVariant(variantId: string, ctx: InventorySkuResolveContext): Promise<DbVariant | null> {
  const cached = ctx.variantsById.get(variantId)
  if (cached) return cached
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, name, variant_type, label_lt, label_en')
    .eq('id', variantId)
    .maybeSingle()

  if (error || !data) return null
  const row = data as unknown as DbVariant
  ctx.variantsById.set(variantId, row)
  return row
}

function normalizeUsageType(input: unknown): string | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'facade' || v === 'terrace' || v === 'interior' || v === 'fence') return v
  return null
}

export async function resolveInventorySkuForCartItem(
  item: {
    id: string
    color?: string
    finish?: string
    configuration?: {
      usageType?: unknown
      profileVariantId?: unknown
      colorVariantId?: unknown
      thicknessMm?: unknown
      widthMm?: unknown
      lengthMm?: unknown
    }
  },
  ctx: InventorySkuResolveContext
): Promise<string | null> {
  if (!supabaseAdmin) return null

  const product = await loadProduct(item.id, ctx)
  if (!product) return null

  const cfg = item.configuration ?? undefined
  const usageType = normalizeUsageType(cfg?.usageType) ?? normalizeUsageType(product.usage_type) ?? null
  const woodType = product.wood_type ?? null

  const widthMm = typeof cfg?.widthMm === 'number' ? cfg.widthMm : Number(cfg?.widthMm)
  const lengthMm = typeof cfg?.lengthMm === 'number' ? cfg.lengthMm : Number(cfg?.lengthMm)
  const thicknessMm =
    typeof cfg?.thicknessMm === 'number'
      ? cfg.thicknessMm
      : cfg?.thicknessMm !== undefined
        ? Number(cfg.thicknessMm)
        : usageType === 'terrace'
          ? 28
          : 20

  const profileVariantId = typeof cfg?.profileVariantId === 'string' ? cfg.profileVariantId : null
  const colorVariantId = typeof cfg?.colorVariantId === 'string' ? cfg.colorVariantId : null

  const profileVariant = profileVariantId ? await loadVariant(profileVariantId, ctx) : null
  const colorVariant = colorVariantId ? await loadVariant(colorVariantId, ctx) : null

  const profileCodeOrLabel = profileVariant?.name ?? item.finish ?? null
  const colorCodeOrLabel = colorVariant?.name ?? item.color ?? null

  return buildInventorySku({
    usageType,
    woodType,
    profile: profileCodeOrLabel,
    color: colorCodeOrLabel,
    widthMm: Number.isFinite(widthMm) ? widthMm : null,
    lengthMm: Number.isFinite(lengthMm) ? lengthMm : null,
    thicknessMm: Number.isFinite(thicknessMm) ? thicknessMm : null,
  })
}

