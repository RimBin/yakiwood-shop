// Cart Stock Validation
import { InventoryManager } from '@/lib/inventory/manager';
import type { CartItem } from '@/lib/cart/types';

export interface StockValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  unavailableItems: {
    id: string;
    name: string;
    requested: number;
    available: number;
  }[];
}

/**
 * Validate stock availability for all cart items
 */
export async function validateCartStock(items: CartItem[]): Promise<StockValidationResult> {
  const result: StockValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    unavailableItems: [],
  };

  if (items.length === 0) {
    result.valid = false;
    result.errors.push('Cart is empty');
    return result;
  }

  // Check stock for each item
  for (const item of items) {
    try {
      const stockCheck = await InventoryManager.checkStock(
        item.id,
        item.quantity
      );

      if (!stockCheck.available) {
        result.valid = false;
        result.errors.push(
          `${item.name} is ${stockCheck.quantity_available === 0 ? 'out of stock' : 'low on stock'}`
        );
        result.unavailableItems.push({
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: stockCheck.quantity_available,
        });
      } else if (stockCheck.quantity_available < item.quantity * 2) {
        // Warning: stock is low but sufficient
        result.warnings.push(
          `${item.name} has limited stock (${stockCheck.quantity_available} available)`
        );
      }
    } catch (error) {
      console.error(`Failed to check stock for ${item.id}:`, error);
      result.valid = false;
      result.errors.push(`Unable to verify stock for ${item.name}`);
    }
  }

  return result;
}

/**
 * Check if a single product variant has stock
 */
export async function checkProductStock(
  productId: string,
  quantity: number = 1,
  variantId?: string
): Promise<{
  available: boolean;
  quantity: number;
  message?: string;
}> {
  try {
    const stockCheck = await InventoryManager.checkStock(
      productId,
      quantity,
      variantId
    );

    let message: string | undefined;
    if (!stockCheck.available) {
      if (stockCheck.quantity_available === 0) {
        message = 'Out of stock';
      } else {
        message = `Only ${stockCheck.quantity_available} available`;
      }
    }

    return {
      available: stockCheck.available,
      quantity: stockCheck.quantity_available,
      message,
    };
  } catch (error) {
    console.error('Stock check error:', error);
    return {
      available: false,
      quantity: 0,
      message: 'Unable to check stock',
    };
  }
}

/**
 * Get maximum quantity available for a product
 */
export async function getMaxQuantity(
  productId: string,
  variantId?: string
): Promise<number> {
  try {
    const quantity = await InventoryManager.getStockLevel(productId, variantId);
    return Math.max(0, quantity);
  } catch (error) {
    console.error('Failed to get max quantity:', error);
    return 0;
  }
}

/**
 * Adjust cart quantities to match available stock
 */
export async function adjustCartToStock(items: CartItem[]): Promise<{
  adjustedItems: CartItem[];
  removedItems: CartItem[];
  adjustments: string[];
}> {
  const adjustedItems: CartItem[] = [];
  const removedItems: CartItem[] = [];
  const adjustments: string[] = [];

  for (const item of items) {
    try {
      const stockLevel = await InventoryManager.getStockLevel(item.id);

      if (stockLevel === 0) {
        // Remove out of stock items
        removedItems.push(item);
        adjustments.push(`Removed ${item.name} (out of stock)`);
      } else if (stockLevel < item.quantity) {
        // Adjust quantity to available stock
        adjustedItems.push({
          ...item,
          quantity: stockLevel,
        });
        adjustments.push(
          `Adjusted ${item.name} quantity from ${item.quantity} to ${stockLevel}`
        );
      } else {
        // Keep as is
        adjustedItems.push(item);
      }
    } catch (error) {
      console.error(`Failed to adjust ${item.id}:`, error);
      // Keep item on error
      adjustedItems.push(item);
    }
  }

  return {
    adjustedItems,
    removedItems,
    adjustments,
  };
}
