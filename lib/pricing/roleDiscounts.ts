export type DiscountType = 'percent' | 'fixed'

export interface RoleDiscount {
  role: string
  discount_type: DiscountType
  discount_value: number
  currency?: string
  is_active?: boolean
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function applyRoleDiscount(basePrice: number, discount: RoleDiscount | null | undefined): number {
  const safeBase = Number.isFinite(basePrice) ? basePrice : 0
  if (!discount || discount.is_active === false) return roundMoney(Math.max(0, safeBase))

  const value = Number(discount.discount_value)
  if (!Number.isFinite(value) || value <= 0) return roundMoney(Math.max(0, safeBase))

  if (discount.discount_type === 'percent') {
    const percent = Math.min(100, Math.max(0, value))
    return roundMoney(Math.max(0, safeBase * (1 - percent / 100)))
  }

  // fixed
  return roundMoney(Math.max(0, safeBase - value))
}
