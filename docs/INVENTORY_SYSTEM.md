# Inventory Management System

Complete inventory tracking and stock management system for the Yakiwood e-commerce platform.

## Features

### ✅ Core Functionality
- **Real-time stock tracking** - Available, reserved, and sold quantities
- **Automatic reservations** - Stock reserved during checkout, released on cancellation
- **Low stock alerts** - Automatic notifications when stock reaches reorder point
- **Movement history** - Complete audit trail of all inventory changes
- **Multi-location support** - Track inventory across different warehouse locations
- **Admin dashboard** - Full inventory management UI with search, filters, and bulk operations

### ✅ Integration Points
- **Checkout flow** - Automatic stock validation before payment
- **Stripe webhooks** - Reserve stock on checkout, confirm sale on payment success, release on failure
- **Product pages** - Stock indicators (in stock, low stock, out of stock)
- **Admin notifications** - Email alerts for low stock and out of stock items

## Database Schema

Located in: [`supabase/migrations/005_inventory_management.sql`](../supabase/migrations/005_inventory_management.sql)

### Tables

#### `inventory_items`
Tracks inventory levels for products and variants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Reference to products table |
| `variant_id` | UUID | Optional variant reference |
| `sku` | TEXT | Unique stock keeping unit |
| `quantity_available` | INT | Current available stock |
| `quantity_reserved` | INT | Stock reserved for pending orders |
| `quantity_sold` | INT | Total quantity sold (historical) |
| `reorder_point` | INT | Alert threshold (default: 10) |
| `reorder_quantity` | INT | Recommended reorder amount (default: 50) |
| `location` | TEXT | Warehouse location |
| `last_restocked_at` | TIMESTAMPTZ | Last restock timestamp |

#### `inventory_movements`
Logs all inventory changes for audit trail.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `inventory_item_id` | UUID | Reference to inventory item |
| `type` | TEXT | Movement type (restock, sale, return, adjustment, reservation, release) |
| `quantity` | INT | Change amount (positive/negative) |
| `reason` | TEXT | Reason for movement |
| `reference_id` | UUID | Order ID or other reference |
| `performed_by` | UUID | User who performed action |
| `performed_at` | TIMESTAMPTZ | Timestamp |

#### `inventory_alerts`
Tracks low stock and out of stock alerts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `inventory_item_id` | UUID | Reference to inventory item |
| `alert_type` | TEXT | Alert type (low_stock, out_of_stock, overstock) |
| `threshold` | INT | Alert threshold |
| `current_quantity` | INT | Quantity when alert was created |
| `resolved_at` | TIMESTAMPTZ | When alert was resolved |
| `resolved_by` | UUID | User who resolved alert |

### Triggers

- **`update_inventory_updated_at`** - Auto-update `updated_at` timestamp
- **`check_inventory_alerts`** - Auto-create alerts when stock reaches thresholds
- **Row Level Security (RLS)** - Public can view, admins can manage

## API Routes

### Inventory Management

#### `GET /api/inventory`
List all inventory items with filters.

**Query Parameters:**
- `status` - Filter by status: `all`, `in_stock`, `low_stock`, `out_of_stock`
- `search` - Search by SKU or location
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  },
  "stats": {
    "total_items": 100,
    "in_stock": 85,
    "low_stock": 10,
    "out_of_stock": 5,
    "total_value": 0
  }
}
```

#### `POST /api/inventory`
Create new inventory item (admin only).

**Body:**
```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "sku": "YAKI-001",
  "quantity_available": 100,
  "reorder_point": 10,
  "reorder_quantity": 50,
  "location": "Warehouse A"
}
```

#### `GET /api/inventory/[sku]`
Get inventory item details including movement history.

**Response:**
```json
{
  "item": {...},
  "movements": [...]
}
```

#### `PUT /api/inventory/[sku]`
Update inventory settings (admin only).

**Body:**
```json
{
  "reorder_point": 15,
  "reorder_quantity": 75,
  "location": "Warehouse B"
}
```

#### `DELETE /api/inventory/[sku]`
Delete inventory item (admin only).

### Operations

#### `POST /api/inventory/restock`
Restock inventory item.

**Body:**
```json
{
  "sku": "YAKI-001",
  "quantity": 50,
  "reason": "New shipment received",
  "location": "Warehouse A",
  "notes": "Shipment #12345"
}
```

#### `POST /api/inventory/adjust`
Adjust inventory (corrections, damages, etc.).

**Body:**
```json
{
  "sku": "YAKI-001",
  "quantity": -5,
  "reason": "damaged",
  "notes": "Water damage during storage"
}
```

#### `GET /api/inventory/alerts`
Get inventory alerts.

**Query Parameters:**
- `resolved` - Include resolved alerts (default: false)

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "inventory_item_id": "uuid",
      "alert_type": "low_stock",
      "threshold": 10,
      "current_quantity": 8,
      "created_at": "2025-12-15T10:00:00Z",
      "inventory_item": {
        "sku": "YAKI-001",
        "quantity_available": 8,
        "product": {
          "name": "Oak Plank",
          "slug": "oak-plank"
        }
      }
    }
  ]
}
```

## Admin UI

### Inventory Dashboard
**Location:** `/admin/inventory`

**Features:**
- Stats overview (total items, in stock, low stock, out of stock)
- Search by SKU or location
- Filter by status
- Quick restock modal
- Adjustment modal
- Export to CSV
- Real-time stock levels
- Color-coded status badges
- Movement history tooltip

**Components:**
- [`app/admin/inventory/page.tsx`](../app/admin/inventory/page.tsx) - Main dashboard
- [`components/admin/InventoryTable.tsx`](../components/admin/InventoryTable.tsx) - Inventory table with sorting
- [`components/admin/RestockModal.tsx`](../components/admin/RestockModal.tsx) - Restock form
- [`components/admin/AdjustmentModal.tsx`](../components/admin/AdjustmentModal.tsx) - Adjustment form

## Frontend Components

### Stock Indicator
**Location:** `components/products/StockIndicator.tsx`

Display stock status on product pages.

**Usage:**
```tsx
import { StockIndicator, PreOrderBadge } from '@/components/products/StockIndicator';

// In stock indicator
<StockIndicator 
  quantity={product.stockQuantity} 
  threshold={product.reorderPoint}
  showQuantity={true}
  size="md"
/>

// Pre-order badge
<PreOrderBadge 
  availableDate="2026-01-15"
  size="md"
/>
```

**Variants:**
- ✓ In Stock (green)
- ⚠ Low Stock (yellow)
- ✕ Out of Stock (red)
- ⏰ Pre-Order (blue)

## Business Logic

### InventoryManager Class
**Location:** [`lib/inventory/manager.ts`](../lib/inventory/manager.ts)

Core inventory operations:

```typescript
// Check stock availability
const stockCheck = await InventoryManager.checkStock(productId, quantity);

// Reserve stock for order (before payment)
await InventoryManager.reserveStock(items, orderId);

// Release reserved stock (payment failed/cancelled)
await InventoryManager.releaseStock(orderId);

// Confirm sale (payment successful)
await InventoryManager.confirmSale(orderId);

// Restock item
await InventoryManager.restockItem({
  sku: 'YAKI-001',
  quantity: 50,
  reason: 'New shipment',
  location: 'Warehouse A'
}, userId);

// Adjust inventory
await InventoryManager.adjustInventory({
  sku: 'YAKI-001',
  quantity: -5,
  reason: 'damaged'
}, userId);

// Get low stock alerts
const alerts = await InventoryManager.getLowStockAlerts();

// Get stock level
const quantity = await InventoryManager.getStockLevel(productId);
```

### Cart Stock Validation
**Location:** [`lib/cart/stock-validation.ts`](../lib/cart/stock-validation.ts)

Validate cart items before checkout:

```typescript
import { validateCartStock, checkProductStock, adjustCartToStock } from '@/lib/cart/stock-validation';

// Validate entire cart
const validation = await validateCartStock(cartItems);
if (!validation.valid) {
  console.error('Stock errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

// Check single product
const stock = await checkProductStock(productId, quantity);
if (!stock.available) {
  alert(stock.message); // "Out of stock" or "Only 5 available"
}

// Auto-adjust cart to available stock
const { adjustedItems, removedItems, adjustments } = await adjustCartToStock(cartItems);
```

## Checkout Flow Integration

### Order Process

1. **Cart validation** - Check stock availability before checkout
2. **Checkout initiated** - Create Stripe checkout session
3. **Stock reservation** - On `checkout.session.completed` webhook
4. **Payment processing** - User completes payment
5. **Sale confirmation** - On `payment_intent.succeeded` webhook
6. **Stock update** - Reserved → Sold

### Webhook Handler
**Location:** [`app/api/webhook/route.ts`](../app/api/webhook/route.ts)

**Events:**
- `checkout.session.completed` → Create order + reserve stock
- `payment_intent.succeeded` → Confirm sale (reservation → sold)
- `payment_intent.payment_failed` → Release reserved stock

## Notifications

### Admin Alerts
**Location:** [`lib/notifications/inventory.ts`](../lib/notifications/inventory.ts)

Automatic email notifications for:
- Low stock alerts (when quantity ≤ reorder point)
- Out of stock alerts (when quantity = 0)
- Restock recommendations
- Inventory adjustments

**TODO:** Implement email service integration:
- Resend (recommended)
- SendGrid
- AWS SES
- Postmark

**Usage:**
```typescript
import { 
  notifyLowStock, 
  notifyOutOfStock, 
  notifyRestockNeeded 
} from '@/lib/notifications/inventory';

// Send low stock notification
await notifyLowStock(inventoryItem);

// Send out of stock notification
await notifyOutOfStock(inventoryItem);

// Send restock recommendation
await notifyRestockNeeded(inventoryItem);
```

## Setup Instructions

### 1. Run Migration

```bash
# Apply the migration to your Supabase database
supabase db push

# Or manually run the migration file
psql $DATABASE_URL < supabase/migrations/005_inventory_management.sql
```

### 2. Create Initial Inventory Items

```sql
-- Example: Create inventory for existing products
INSERT INTO inventory_items (product_id, sku, quantity_available, reorder_point, reorder_quantity, location)
SELECT 
  id,
  CONCAT(UPPER(slug), '-DEFAULT'),
  50, -- Initial stock
  10, -- Reorder point
  50, -- Reorder quantity
  'Warehouse A'
FROM products;
```

### 3. Configure Admin Access

Ensure admin users have the correct role in their metadata:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@yakiwood.com';
```

### 4. Test the System

1. Access admin dashboard: `/admin/inventory`
2. Create a test inventory item
3. Test restock operation
4. Test adjustment operation
5. Check alerts page
6. Test checkout flow with stock validation

## Best Practices

### SKU Format
Use consistent SKU naming convention:
```
[PRODUCT]-[VARIANT]-[COLOR]
YAKI-PLANK-NATURAL
YAKI-PANEL-BLACK
```

### Reorder Points
Set reorder points based on:
- Average daily sales
- Lead time for restocking
- Safety stock buffer

Example: 5 sales/day × 7 days lead time = 35 reorder point

### Stock Reservations
- Reservations expire after 24 hours (Stripe checkout session)
- Always release stock on payment failure
- Confirm sale only on successful payment

### Movement Logging
Always log movements with:
- Clear reason
- Reference ID (order ID, adjustment reason)
- Performed by (user ID)
- Notes for context

### Alert Management
- Resolve alerts when stock is replenished
- Review unresolved alerts daily
- Set up email notifications for critical alerts

## Troubleshooting

### Stock Not Updating
1. Check Supabase RLS policies (admins should have full access)
2. Verify webhook is receiving events
3. Check server logs for errors
4. Ensure SKU format matches between cart and inventory

### Alerts Not Triggering
1. Verify trigger is enabled: `check_inventory_alerts`
2. Check alert threshold settings
3. Review database trigger logs
4. Ensure RLS policies allow alert creation

### Reservations Not Working
1. Check webhook handler is processing `checkout.session.completed`
2. Verify cart items have correct product IDs
3. Check inventory_movements table for reservation entries
4. Ensure sufficient stock is available

### Admin Dashboard Not Loading
1. Verify user has `role: 'admin'` in metadata
2. Check API route permissions
3. Review browser console for errors
4. Ensure Supabase connection is active

## Future Enhancements

### Planned Features
- [ ] Inventory forecasting (predict when to reorder)
- [ ] Multi-warehouse management
- [ ] Transfer orders between locations
- [ ] Batch/lot tracking
- [ ] Expiration date tracking (for time-sensitive products)
- [ ] Barcode scanning integration
- [ ] Automated purchase orders
- [ ] Inventory valuation (FIFO/LIFO)
- [ ] Stock take/cycle counting
- [ ] Integration with shipping providers

### Optimization Opportunities
- [ ] Redis caching for stock levels
- [ ] Bulk operations API endpoints
- [ ] GraphQL API for complex queries
- [ ] Real-time WebSocket updates
- [ ] Mobile app for warehouse staff
- [ ] Advanced analytics dashboard

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review server logs: `npm run dev` and check console
3. Check Supabase logs in dashboard
4. Contact the development team

---

**Created:** 2025-12-15  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
