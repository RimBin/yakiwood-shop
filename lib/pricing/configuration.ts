import { supabaseAdmin } from '@/lib/supabase-admin'

export type UsageType = 'facade' | 'terrace' | 'interior' | 'fence'

export type InputMode = 'boards' | 'area'

export type AreaRoundingMode = 'ceil' | 'round' | 'floor'

export type AreaRoundingInfo = {
  requestedAreaM2: number
  actualAreaM2: number
  deltaAreaM2: number
  rounding: AreaRoundingMode
}

export type ConfigurationPriceSelectors = {
  productId: string
  usageType?: UsageType
  profileVariantId?: string
  colorVariantId?: string
  thicknessOptionId?: string
  widthMm?: number
  lengthMm?: number
  cartTotalAreaM2?: number
}

export type ConfigurationPricingResult = {
  unitPricePerM2: number
  // Area of a single board (m²)
  areaM2: number
  // Total line area (m²) = areaM2 * quantityBoards
  totalAreaM2: number
  unitPricePerBoard: number
  quantityBoards: number
  lineTotal: number
  inputMode: InputMode
  roundingInfo?: AreaRoundingInfo
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

export function computeTotalAreaM2(widthMm: number, lengthMm: number, quantityBoards: number): number {
  const unitArea = computeAreaM2(widthMm, lengthMm)
  const qty = Number.isFinite(quantityBoards) ? Math.max(0, Math.round(quantityBoards)) : 0
  return unitArea * qty
}

export function computeQuantityBoardsFromAreaM2(
  widthMm: number,
  lengthMm: number,
  targetAreaM2: number,
  rounding: AreaRoundingMode = 'ceil'
): { quantityBoards: number; roundingInfo: AreaRoundingInfo } {
  const unitArea = computeAreaM2(widthMm, lengthMm)
  const requestedAreaM2 = Number.isFinite(targetAreaM2) ? Math.max(0, targetAreaM2) : 0

  if (unitArea <= 0 || requestedAreaM2 <= 0) {
    return {
      quantityBoards: 0,
      roundingInfo: {
        requestedAreaM2,
        actualAreaM2: 0,
        deltaAreaM2: 0,
        rounding,
      },
    }
  }

  const rawQty = requestedAreaM2 / unitArea
  const quantityBoards =
    rounding === 'floor'
      ? Math.floor(rawQty)
      : rounding === 'round'
        ? Math.round(rawQty)
        : Math.ceil(rawQty)

  const actualAreaM2 = unitArea * Math.max(0, quantityBoards)
  const deltaAreaM2 = actualAreaM2 - requestedAreaM2

  return {
    quantityBoards: Math.max(0, quantityBoards),
    roundingInfo: {
      requestedAreaM2,
      actualAreaM2,
      deltaAreaM2,
      rounding,
    },
  }
}

type DbConfigurationPriceRow = {
  id: string
  unit_price_per_m2: string | number
  usage_type: string | null
  profile_variant_id: string | null
  color_variant_id: string | null
  thickness_option_id?: string | null
  width_mm: number | null
  length_mm: number | null
  min_cart_area_m2?: number | null
  max_cart_area_m2?: number | null
}

function calcSpecificity(row: DbConfigurationPriceRow): number {
  return (
    (row.usage_type ? 1 : 0) +
    (row.profile_variant_id ? 1 : 0) +
    (row.color_variant_id ? 1 : 0) +
    (row.thickness_option_id ? 1 : 0) +
    (row.width_mm !== null ? 1 : 0) +
    (row.length_mm !== null ? 1 : 0) +
    (row.min_cart_area_m2 !== undefined && row.min_cart_area_m2 !== null ? 1 : 0) +
    (row.max_cart_area_m2 !== undefined && row.max_cart_area_m2 !== null ? 1 : 0)
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
  const thicknessOptionId = selectors.thicknessOptionId
  const widthMm = typeof selectors.widthMm === 'number' ? selectors.widthMm : undefined
  const lengthMm = typeof selectors.lengthMm === 'number' ? selectors.lengthMm : undefined
  const cartTotalAreaM2 =
    typeof selectors.cartTotalAreaM2 === 'number' && Number.isFinite(selectors.cartTotalAreaM2)
      ? selectors.cartTotalAreaM2
      : undefined

  // Fetch a small candidate set; then rank in code (stable even if SQL ordering differs by NULL semantics).
  const withOptionalSelectors = await supabaseAdmin
    .from('product_configuration_prices')
    .select(
      'id,unit_price_per_m2,usage_type,profile_variant_id,color_variant_id,thickness_option_id,width_mm,length_mm,min_cart_area_m2,max_cart_area_m2'
    )
    .eq('product_id', productId)
    .eq('is_active', true)

  const { data, error } = withOptionalSelectors.error
    ? await supabaseAdmin
        .from('product_configuration_prices')
        .select('id,unit_price_per_m2,usage_type,profile_variant_id,color_variant_id,width_mm,length_mm')
        .eq('product_id', productId)
        .eq('is_active', true)
    : withOptionalSelectors

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

    // Thickness is an optional selector (newer schema). Only filter when the column exists.
    if (row.thickness_option_id !== undefined) {
      if (row.thickness_option_id !== null && thicknessOptionId && row.thickness_option_id !== thicknessOptionId)
        return false
      if (row.thickness_option_id !== null && !thicknessOptionId) return false
    }

    if (row.width_mm !== null && widthMm && row.width_mm !== widthMm) return false
    if (row.width_mm !== null && !widthMm) return false

    if (row.length_mm !== null && lengthMm && row.length_mm !== lengthMm) return false
    if (row.length_mm !== null && !lengthMm) return false

    // Optional selector: cart total area thresholds.
    if (row.min_cart_area_m2 !== undefined || row.max_cart_area_m2 !== undefined) {
      const min = row.min_cart_area_m2 ?? null
      const max = row.max_cart_area_m2 ?? null

      // If DB row is scoped by thresholds but the caller didn't provide cartTotalAreaM2, treat as non-match.
      if ((min !== null || max !== null) && cartTotalAreaM2 === undefined) return false

      if (cartTotalAreaM2 !== undefined) {
        if (typeof min === 'number' && Number.isFinite(min) && cartTotalAreaM2 < min) return false
        if (typeof max === 'number' && Number.isFinite(max) && cartTotalAreaM2 >= max) return false
      }
    }

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
  thicknessOptionId?: string
  widthMm: number
  lengthMm: number
  quantityBoards?: number
  inputMode?: InputMode
  targetAreaM2?: number
  rounding?: AreaRoundingMode
  cartTotalAreaM2?: number
}): Promise<ConfigurationPricingResult | null> {
  const widthMm = Number(input.widthMm) || 0
  const lengthMm = Number(input.lengthMm) || 0
  const areaM2 = computeAreaM2(widthMm, lengthMm)
  if (areaM2 <= 0) return null

  const inputMode: InputMode = input.inputMode === 'area' ? 'area' : 'boards'

  const resolvedQuantity =
    inputMode === 'area'
      ? computeQuantityBoardsFromAreaM2(widthMm, lengthMm, Number(input.targetAreaM2) || 0, input.rounding ?? 'ceil')
      : null

  const quantityBoards =
    inputMode === 'area'
      ? resolvedQuantity?.quantityBoards ?? 0
      : Math.max(0, Math.round(Number(input.quantityBoards) || 0))

  if (quantityBoards <= 0) return null

  const resolved = await resolveConfigurationUnitPricePerM2({
    productId: input.productId,
    usageType: input.usageType,
    profileVariantId: input.profileVariantId,
    colorVariantId: input.colorVariantId,
    thicknessOptionId: input.thicknessOptionId,
    widthMm,
    lengthMm,
    cartTotalAreaM2: input.cartTotalAreaM2,
  })

  if (!resolved) return null

  const unitPricePerM2 = resolved.unitPricePerM2
  const unitPricePerBoard = unitPricePerM2 * areaM2
  const lineTotal = unitPricePerBoard * quantityBoards
  const totalAreaM2 = areaM2 * quantityBoards

  return {
    unitPricePerM2,
    areaM2,
    totalAreaM2,
    unitPricePerBoard,
    quantityBoards,
    lineTotal,
    inputMode,
    roundingInfo: inputMode === 'area' ? resolvedQuantity?.roundingInfo : undefined,
    resolvedBy: {
      matchedRowId: resolved.matchedRowId,
      specificity: resolved.specificity,
    },
  }
}
