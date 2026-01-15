export const FREE_SHIPPING_THRESHOLD_EUR = 500
export const STANDARD_SHIPPING_EUR = 15

// UK-first messaging (currency stays EUR until checkout/pricing is switched to GBP)
export const DELIVERY_ESTIMATE_BUSINESS_DAYS = { min: 3, max: 5 } as const

export function calculateShippingEur(subtotalEur: number): number {
  const subtotal = Number(subtotalEur)
  if (!Number.isFinite(subtotal) || subtotal <= 0) return STANDARD_SHIPPING_EUR
  // Keep behavior consistent with checkout page (> 500 => free)
  return subtotal > FREE_SHIPPING_THRESHOLD_EUR ? 0 : STANDARD_SHIPPING_EUR
}

export function formatDeliverySummaryLt(): string {
  return `Pristatymas į Jungtinę Karalystę (JK): ${STANDARD_SHIPPING_EUR}€ (nemokamas virš ${FREE_SHIPPING_THRESHOLD_EUR}€). Terminas: ${DELIVERY_ESTIMATE_BUSINESS_DAYS.min}-${DELIVERY_ESTIMATE_BUSINESS_DAYS.max} d. d.`
}

export function formatDeliverySummaryEn(): string {
  return `Delivery in the UK: €${STANDARD_SHIPPING_EUR} (free over €${FREE_SHIPPING_THRESHOLD_EUR}). ETA: ${DELIVERY_ESTIMATE_BUSINESS_DAYS.min}-${DELIVERY_ESTIMATE_BUSINESS_DAYS.max} business days.`
}
