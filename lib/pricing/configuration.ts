import { supabaseAdmin } from '@/lib/supabase-admin'

export type UsageType = 'facade' | 'terrace' | 'interior' | 'fence'

export type ConfigurationPriceSelectors = {
  productId: string
  usageType?: UsageType
  profileVariantId?: string
  colorVariantId?: string
  widthMm?: number
  lengthMm?: number
}

export type ConfigurationPricingResult = {
  unitPricePerM2: number
  areaM2: number
  unitPricePerBoard: number
  quantityBoards: number
  lineTotal: number
  resolvedBy: {
    matchedRowId: string
    specificity: number
  }
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export function computeAreaM2(widthMm: number, lengthMm: number): number {
  // mm -> m
  const widthM = widthMm / 1000
  const lengthM = lengthMm / 1000
  const area = widthM * lengthM
  return Number.isFinite(area) && area > 0 ? area : 0
}

type DbConfigurationPriceRow = {
  id: string
  unit_price_per_m2: string | number
  usage_type: string | null
  profile_variant_id: string | null
  color_variant_id: string | null
  width_mm: number | null
  length_mm: number | null
}

function calcSpecificity(row: DbConfigurationPriceRow): number {
  return (
    (row.usage_type ? 1 : 0) +
    (row.profile_variant_id ? 1 : 0) +
    (row.color_variant_id ? 1 : 0) +
    (row.width_mm !== null ? 1 : 0) +
    (row.length_mm !== null ? 1 : 0)
  )
}

export async function resolveConfigurationUnitPricePerM2(
  selectors: ConfigurationPriceSelectors
): Promise<{ unitPricePerM2: number; matchedRowId: string; specificity: number } | null> {
  if (!supabaseAdmin) return null

  const productId = selectors.productId
  const usageType = selectors.usageType
  const profileVariantId = selectors.profileVariantId
  const colorVariantId = selectors.colorVariantId
  const widthMm = typeof selectors.widthMm === 'number' ? selectors.widthMm : undefined
  const lengthMm = typeof selectors.lengthMm === 'number' ? selectors.lengthMm : undefined

  // Fetch a small candidate set; then rank in code (stable even if SQL ordering differs by NULL semantics).
  const { data, error } = await supabaseAdmin
    .from('product_configuration_prices')
    .select('id,unit_price_per_m2,usage_type,profile_variant_id,color_variant_id,width_mm,length_mm')
    .eq('product_id', productId)
    .eq('is_active', true)

  if (error || !data) {
    console.error('Failed to fetch configuration prices', error)
    return null
  }

  const candidates = (data as unknown as DbConfigurationPriceRow[]).filter((row) => {
    if (row.usage_type !== null && usageType && row.usage_type !== usageType) return false
    if (row.usage_type !== null && !usageType) return false

    if (row.profile_variant_id !== null && profileVariantId && row.profile_variant_id !== profileVariantId) return false
    if (row.profile_variant_id !== null && !profileVariantId) return false

    if (row.color_variant_id !== null && colorVariantId && row.color_variant_id !== colorVariantId) return false
    if (row.color_variant_id !== null && !colorVariantId) return false

    if (row.width_mm !== null && widthMm && row.width_mm !== widthMm) return false
    if (row.width_mm !== null && !widthMm) return false

    if (row.length_mm !== null && lengthMm && row.length_mm !== lengthMm) return false
    if (row.length_mm !== null && !lengthMm) return false

    return true
  })

  if (!candidates.length) return null

  const ranked = candidates
    .map((row) => ({
      row,
      specificity: calcSpecificity(row),
    }))
    .sort((a, b) => {
      if (b.specificity !== a.specificity) return b.specificity - a.specificity
      // Tie-breaker: stable by id (no created_at needed)
      return b.row.id.localeCompare(a.row.id)
    })

  const best = ranked[0]
  return {
    unitPricePerM2: toNumber(best.row.unit_price_per_m2),
    matchedRowId: best.row.id,
    specificity: best.specificity,
  }
}

export async function quoteConfigurationPricing(input: {
  productId: string
  usageType?: UsageType
  profileVariantId?: string
  colorVariantId?: string
  widthMm: number
  lengthMm: number
  quantityBoards: number
}): Promise<ConfigurationPricingResult | null> {
  const quantityBoards = Number(input.quantityBoards) || 0
  if (quantityBoards <= 0) return null

  const widthMm = Number(input.widthMm) || 0
  const lengthMm = Number(input.lengthMm) || 0
  const areaM2 = computeAreaM2(widthMm, lengthMm)
  if (areaM2 <= 0) return null

  const resolved = await resolveConfigurationUnitPricePerM2({
    productId: input.productId,
    usageType: input.usageType,
    profileVariantId: input.profileVariantId,
    colorVariantId: input.colorVariantId,
    widthMm,
    lengthMm,
  })

  if (!resolved) return null

  const unitPricePerM2 = resolved.unitPricePerM2
  const unitPricePerBoard = unitPricePerM2 * areaM2
  const lineTotal = unitPricePerBoard * quantityBoards

  return {
    unitPricePerM2,
    areaM2,
    unitPricePerBoard,
    quantityBoards,
    lineTotal,
    resolvedBy: {
      matchedRowId: resolved.matchedRowId,
      specificity: resolved.specificity,
    },
  }
}
