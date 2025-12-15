// Inventory Management Types

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  reorder_point: number;
  reorder_quantity: number;
  location?: string;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference_id?: string;
  performed_by?: string;
  performed_at: string;
  notes?: string;
}

export type MovementType = 
  | 'restock' 
  | 'sale' 
  | 'return' 
  | 'adjustment' 
  | 'reservation' 
  | 'release';

export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  alert_type: AlertType;
  threshold?: number;
  current_quantity: number;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export type AlertType = 'low_stock' | 'out_of_stock' | 'overstock';

export interface StockCheckResult {
  available: boolean;
  quantity_available: number;
  sku: string;
}

export interface RestockRequest {
  sku: string;
  quantity: number;
  reason?: string;
  location?: string;
  notes?: string;
}

export interface AdjustmentRequest {
  sku: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface ReservationItem {
  product_id: string;
  variant_id?: string;
  sku: string;
  quantity: number;
}

export interface InventoryWithProduct extends InventoryItem {
  product?: {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
  };
}

export interface InventoryFilters {
  status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  search?: string;
  location?: string;
}

export interface InventoryStats {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_value: number;
}
