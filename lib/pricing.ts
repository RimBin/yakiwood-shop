export function calculateProductPrice(
  basePrice: number,
  colorModifier: number = 0,
  profileModifier: number = 0,
  quantity: number = 1
): number {
  const subtotal = basePrice + colorModifier + profileModifier;
  return subtotal * quantity;
}
