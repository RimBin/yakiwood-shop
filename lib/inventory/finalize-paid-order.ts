import { InventoryManager } from '@/lib/inventory/manager';
import { createInventorySkuResolveContext, resolveInventorySkuForCartItem } from '@/lib/inventory/sku.server';
import type { ReservationItem } from '@/lib/inventory/types';

export type PaidOrderItem = {
  id: string;
  slug?: string;
  quantity: number;
  color?: string;
  finish?: string;
  configuration?: {
    usageType?: unknown;
    profileVariantId?: unknown;
    colorVariantId?: unknown;
    thicknessMm?: unknown;
    widthMm?: unknown;
    lengthMm?: unknown;
  };
};

function toUpperSafe(value: unknown): string {
  return String(value || '').trim().toUpperCase();
}

function buildFallbackSku(item: PaidOrderItem): string {
  const option = String(item.color || item.finish || 'default');
  const optionCode = toUpperSafe(option) || 'DEFAULT';
  const slugCode = toUpperSafe(item.slug);
  return slugCode ? `${slugCode}-${optionCode}` : optionCode;
}

export async function finalizePaidOrderInventory(params: {
  orderId: string;
  items: PaidOrderItem[];
}): Promise<{ reservedCount: number }> {
  const { orderId, items } = params;

  const ctx = createInventorySkuResolveContext();

  const reservationItems: ReservationItem[] = (
    await Promise.all(
      (Array.isArray(items) ? items : [])
        .filter((item) => {
          if (!item) return false;
          const id = String(item.id || '').trim();
          if (!id) return false;
          if (id === 'shipping' || item.slug === 'shipping') return false;
          const qty = Number(item.quantity) || 0;
          return qty > 0;
        })
        .map(async (item) => {
          const resolved = await resolveInventorySkuForCartItem(
            {
              id: String(item.id || ''),
              color: typeof item.color === 'string' ? item.color : undefined,
              finish: typeof item.finish === 'string' ? item.finish : undefined,
              configuration:
                item && typeof item.configuration === 'object' && item.configuration !== null
                  ? item.configuration
                  : undefined,
            },
            ctx
          );

          return {
            product_id: String(item.id || ''),
            sku: resolved || buildFallbackSku(item),
            quantity: Number(item.quantity) || 0,
          };
        })
    )
  ).filter((item) => item.quantity > 0);

  if (!reservationItems.length) {
    return { reservedCount: 0 };
  }

  await InventoryManager.reserveStock(reservationItems, orderId);
  await InventoryManager.confirmSale(orderId);

  return { reservedCount: reservationItems.length };
}
