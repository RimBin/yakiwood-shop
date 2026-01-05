// Inventory Manager - Core business logic for inventory operations
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { 
  InventoryItem, 
  InventoryMovement, 
  InventoryAlert,
  StockCheckResult,
  RestockRequest,
  AdjustmentRequest,
  ReservationItem,
  MovementType
} from './types';

async function getSupabaseClient() {
  // Prefer service-role client for server automation (webhooks, background jobs).
  // Falls back to cookie-based server client for request-context usage.
  if (supabaseAdmin) {
    return supabaseAdmin;
  }
  return await createClient();
}

export class InventoryManager {
  /**
   * Check if sufficient stock is available for a product
   */
  static async checkStock(
    productId: string, 
    quantity: number,
    variantId?: string
  ): Promise<StockCheckResult> {
    const supabase = await getSupabaseClient();
    
    const query = supabase
      .from('inventory_items')
      .select('sku, quantity_available')
      .eq('product_id', productId);
    
    if (variantId) {
      query.eq('variant_id', variantId);
    } else {
      query.is('variant_id', null);
    }
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      return {
        available: false,
        quantity_available: 0,
        sku: 'unknown'
      };
    }
    
    return {
      available: data.quantity_available >= quantity,
      quantity_available: data.quantity_available,
      sku: data.sku
    };
  }

  /**
   * Reserve stock for pending order (before payment confirmation)
   */
  static async reserveStock(
    items: ReservationItem[], 
    orderId: string,
    userId?: string
  ): Promise<void> {
    const supabase = await getSupabaseClient();
    
    for (const item of items) {
      // Get inventory item
      const { data: inventoryItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('sku', item.sku)
        .single();
      
      if (fetchError || !inventoryItem) {
        throw new Error(`Inventory item not found for SKU: ${item.sku}`);
      }
      
      // Check if enough stock is available
      if (inventoryItem.quantity_available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.sku}. Available: ${inventoryItem.quantity_available}, Requested: ${item.quantity}`);
      }
      
      // Update inventory: decrease available, increase reserved
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_available: inventoryItem.quantity_available - item.quantity,
          quantity_reserved: inventoryItem.quantity_reserved + item.quantity,
        })
        .eq('id', inventoryItem.id);
      
      if (updateError) {
        throw new Error(`Failed to reserve stock for ${item.sku}: ${updateError.message}`);
      }
      
      // Log movement
      await this.logMovement({
        inventory_item_id: inventoryItem.id,
        type: 'reservation',
        quantity: -item.quantity,
        reason: 'Order reservation',
        reference_id: orderId,
        performed_by: userId,
      });
    }
  }

  /**
   * Release reserved stock (payment failed or order cancelled)
   */
  static async releaseStock(orderId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    // Get all reservation movements for this order
    const { data: movements, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('inventory_item_id, quantity')
      .eq('reference_id', orderId)
      .eq('type', 'reservation');
    
    if (movementsError || !movements) {
      throw new Error(`Failed to fetch movements for order ${orderId}`);
    }
    
    for (const movement of movements) {
      // Get current inventory item
      const { data: inventoryItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', movement.inventory_item_id)
        .single();
      
      if (fetchError || !inventoryItem) {
        console.error(`Inventory item not found: ${movement.inventory_item_id}`);
        continue;
      }
      
      const quantityToRelease = Math.abs(movement.quantity);
      
      // Update inventory: increase available, decrease reserved
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_available: inventoryItem.quantity_available + quantityToRelease,
          quantity_reserved: Math.max(0, inventoryItem.quantity_reserved - quantityToRelease),
        })
        .eq('id', inventoryItem.id);
      
      if (updateError) {
        console.error(`Failed to release stock: ${updateError.message}`);
        continue;
      }
      
      // Log movement
      await this.logMovement({
        inventory_item_id: inventoryItem.id,
        type: 'release',
        quantity: quantityToRelease,
        reason: 'Order cancelled/failed',
        reference_id: orderId,
      });
    }
  }

  /**
   * Confirm sale (payment successful) - convert reservation to sale
   */
  static async confirmSale(orderId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    // Get all reservation movements for this order
    const { data: movements, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('inventory_item_id, quantity')
      .eq('reference_id', orderId)
      .eq('type', 'reservation');
    
    if (movementsError || !movements) {
      throw new Error(`Failed to fetch movements for order ${orderId}`);
    }
    
    for (const movement of movements) {
      // Get current inventory item
      const { data: inventoryItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', movement.inventory_item_id)
        .single();
      
      if (fetchError || !inventoryItem) {
        console.error(`Inventory item not found: ${movement.inventory_item_id}`);
        continue;
      }
      
      const quantitySold = Math.abs(movement.quantity);
      
      // Update inventory: decrease reserved, increase sold
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_reserved: Math.max(0, inventoryItem.quantity_reserved - quantitySold),
          quantity_sold: inventoryItem.quantity_sold + quantitySold,
        })
        .eq('id', inventoryItem.id);
      
      if (updateError) {
        console.error(`Failed to confirm sale: ${updateError.message}`);
        continue;
      }
      
      // Log movement
      await this.logMovement({
        inventory_item_id: inventoryItem.id,
        type: 'sale',
        quantity: -quantitySold,
        reason: 'Sale confirmed',
        reference_id: orderId,
      });
    }
  }

  /**
   * Restock inventory item
   */
  static async restockItem(request: RestockRequest, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    // Get inventory item by SKU
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', request.sku)
      .single();
    
    if (fetchError || !inventoryItem) {
      throw new Error(`Inventory item not found for SKU: ${request.sku}`);
    }
    
    // Update inventory
    const updateData: Partial<InventoryItem> = {
      quantity_available: inventoryItem.quantity_available + request.quantity,
      last_restocked_at: new Date().toISOString(),
    };
    
    if (request.location) {
      updateData.location = request.location;
    }
    
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', inventoryItem.id);
    
    if (updateError) {
      throw new Error(`Failed to restock: ${updateError.message}`);
    }
    
    // Log movement
    await this.logMovement({
      inventory_item_id: inventoryItem.id,
      type: 'restock',
      quantity: request.quantity,
      reason: request.reason || 'Inventory restocked',
      performed_by: userId,
      notes: request.notes,
    });
  }

  /**
   * Adjust inventory (for corrections or damaged goods)
   */
  static async adjustInventory(request: AdjustmentRequest, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    // Get inventory item by SKU
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', request.sku)
      .single();
    
    if (fetchError || !inventoryItem) {
      throw new Error(`Inventory item not found for SKU: ${request.sku}`);
    }
    
    // Calculate new quantity (can be negative for decreases)
    const newQuantity = inventoryItem.quantity_available + request.quantity;
    
    if (newQuantity < 0) {
      throw new Error(`Adjustment would result in negative stock: ${newQuantity}`);
    }
    
    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        quantity_available: newQuantity,
      })
      .eq('id', inventoryItem.id);
    
    if (updateError) {
      throw new Error(`Failed to adjust inventory: ${updateError.message}`);
    }
    
    // Log movement
    await this.logMovement({
      inventory_item_id: inventoryItem.id,
      type: 'adjustment',
      quantity: request.quantity,
      reason: request.reason,
      performed_by: userId,
      notes: request.notes,
    });
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(): Promise<InventoryAlert[]> {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }
    
    return data || [];
  }

  /**
   * Get stock level for a product
   */
  static async getStockLevel(productId: string, variantId?: string): Promise<number> {
    const supabase = await getSupabaseClient();
    
    const query = supabase
      .from('inventory_items')
      .select('quantity_available')
      .eq('product_id', productId);
    
    if (variantId) {
      query.eq('variant_id', variantId);
    } else {
      query.is('variant_id', null);
    }
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      return 0;
    }
    
    return data.quantity_available;
  }

  /**
   * Get inventory item by SKU
   */
  static async getItemBySku(sku: string): Promise<InventoryItem | null> {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', sku)
      .single();
    
    if (error) {
      return null;
    }
    
    return data;
  }

  /**
   * Log inventory movement
   */
  private static async logMovement(movement: {
    inventory_item_id: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    reference_id?: string;
    performed_by?: string;
    notes?: string;
  }): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('inventory_movements')
      .insert({
        ...movement,
        performed_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Failed to log movement:', error);
      // Don't throw - logging failure shouldn't break the main operation
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
      .from('inventory_alerts')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq('id', alertId);
    
    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  /**
   * Get movement history for an item
   */
  static async getMovementHistory(
    inventoryItemId: string,
    limit: number = 50
  ): Promise<InventoryMovement[]> {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('inventory_item_id', inventoryItemId)
      .order('performed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to fetch movement history: ${error.message}`);
    }
    
    return data || [];
  }
}
