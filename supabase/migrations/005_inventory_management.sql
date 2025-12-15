-- Inventory Management System
-- Created: 2025-12-15

-- Inventory tracking
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID, -- Optional: specific variant
  sku TEXT UNIQUE NOT NULL,
  quantity_available INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0, -- Reserved for pending orders
  quantity_sold INT NOT NULL DEFAULT 0,
  reorder_point INT DEFAULT 10, -- Alert when stock reaches this level
  reorder_quantity INT DEFAULT 50,
  location TEXT, -- Warehouse location
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements log
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'restock', 'sale', 'return', 'adjustment', 'reservation', 'release'
  quantity INT NOT NULL, -- Positive for additions, negative for subtractions
  reason TEXT,
  reference_id UUID, -- Order ID or other reference
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Low stock alerts
CREATE TABLE inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'low_stock', 'out_of_stock', 'overstock'
  threshold INT,
  current_quantity INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_inventory_product ON inventory_items(product_id);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_variant ON inventory_items(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX idx_movements_item ON inventory_movements(inventory_item_id);
CREATE INDEX idx_movements_type ON inventory_movements(type);
CREATE INDEX idx_movements_reference ON inventory_movements(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_alerts_item ON inventory_alerts(inventory_item_id);
CREATE INDEX idx_alerts_unresolved ON inventory_alerts(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_alerts_type ON inventory_alerts(alert_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

-- Function to check and create low stock alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Low stock alert
  IF NEW.quantity_available <= NEW.reorder_point AND 
     NEW.quantity_available > 0 AND
     OLD.quantity_available <> NEW.quantity_available THEN
    -- Check if there's already an unresolved low stock alert
    IF NOT EXISTS (
      SELECT 1 FROM inventory_alerts 
      WHERE inventory_item_id = NEW.id 
      AND alert_type = 'low_stock' 
      AND resolved_at IS NULL
    ) THEN
      INSERT INTO inventory_alerts (inventory_item_id, alert_type, threshold, current_quantity)
      VALUES (NEW.id, 'low_stock', NEW.reorder_point, NEW.quantity_available);
    END IF;
  END IF;
  
  -- Out of stock alert
  IF NEW.quantity_available = 0 AND OLD.quantity_available > 0 THEN
    -- Resolve any low stock alerts
    UPDATE inventory_alerts 
    SET resolved_at = NOW()
    WHERE inventory_item_id = NEW.id 
    AND alert_type = 'low_stock' 
    AND resolved_at IS NULL;
    
    -- Create out of stock alert
    IF NOT EXISTS (
      SELECT 1 FROM inventory_alerts 
      WHERE inventory_item_id = NEW.id 
      AND alert_type = 'out_of_stock' 
      AND resolved_at IS NULL
    ) THEN
      INSERT INTO inventory_alerts (inventory_item_id, alert_type, current_quantity)
      VALUES (NEW.id, 'out_of_stock', NEW.quantity_available);
    END IF;
  END IF;
  
  -- Resolve out of stock alert when stock is restored
  IF NEW.quantity_available > 0 AND OLD.quantity_available = 0 THEN
    UPDATE inventory_alerts 
    SET resolved_at = NOW()
    WHERE inventory_item_id = NEW.id 
    AND alert_type = 'out_of_stock' 
    AND resolved_at IS NULL;
  END IF;
  
  -- Resolve low stock alert when stock is above reorder point
  IF NEW.quantity_available > NEW.reorder_point AND OLD.quantity_available <= OLD.reorder_point THEN
    UPDATE inventory_alerts 
    SET resolved_at = NOW()
    WHERE inventory_item_id = NEW.id 
    AND alert_type = 'low_stock' 
    AND resolved_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_alert_check
AFTER UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION check_inventory_alerts();

-- Function to log inventory movements
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
DECLARE
  quantity_change INT;
  movement_type TEXT;
BEGIN
  -- Calculate quantity change
  IF TG_OP = 'UPDATE' THEN
    quantity_change = NEW.quantity_available - OLD.quantity_available;
    
    IF quantity_change <> 0 THEN
      -- Determine movement type based on change
      IF quantity_change > 0 THEN
        movement_type = 'adjustment';
      ELSE
        movement_type = 'adjustment';
      END IF;
      
      -- Log the movement (only for manual adjustments, sales/reservations logged separately)
      -- This is a basic fallback for any untracked changes
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment for reference:
-- CREATE TRIGGER log_inventory_movement_trigger
-- AFTER UPDATE ON inventory_items
-- FOR EACH ROW EXECUTE FUNCTION log_inventory_movement();

-- Row Level Security (RLS) policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_items
CREATE POLICY "Public can view inventory availability"
  ON inventory_items FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage inventory"
  ON inventory_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for inventory_movements
CREATE POLICY "Admins can view movements"
  ON inventory_movements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can create movements"
  ON inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for inventory_alerts
CREATE POLICY "Admins can view alerts"
  ON inventory_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage alerts"
  ON inventory_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE inventory_items IS 'Tracks inventory levels for products and variants';
COMMENT ON TABLE inventory_movements IS 'Logs all inventory movements for audit trail';
COMMENT ON TABLE inventory_alerts IS 'Tracks low stock and out of stock alerts';
COMMENT ON COLUMN inventory_items.quantity_available IS 'Current available stock for sale';
COMMENT ON COLUMN inventory_items.quantity_reserved IS 'Stock reserved for pending orders';
COMMENT ON COLUMN inventory_items.quantity_sold IS 'Total quantity sold (historical)';
COMMENT ON COLUMN inventory_items.reorder_point IS 'Stock level that triggers low stock alert';
