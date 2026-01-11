-- Pricing quotes (locked pricing) for configurable products

CREATE TABLE IF NOT EXISTS pricing_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- We return a raw token to the client once; store only its HMAC hash.
  token_hash TEXT UNIQUE NOT NULL,

  -- Optional binding (future): user_id if authenticated.
  user_id UUID,

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired')),

  currency TEXT NOT NULL DEFAULT 'EUR',
  vat_rate NUMERIC(5,4) NOT NULL DEFAULT 0.21,

  -- Amounts are stored in cents to avoid float drift.
  subtotal_gross_cents INTEGER NOT NULL,
  shipping_gross_cents INTEGER NOT NULL,
  total_gross_cents INTEGER NOT NULL,
  subtotal_net_cents INTEGER NOT NULL,
  vat_cents INTEGER NOT NULL,

  -- Full snapshot of priced items (server-calculated)
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Idempotency linkage
  consumed_order_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_status ON pricing_quotes(status);
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_expires_at ON pricing_quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_created_at ON pricing_quotes(created_at DESC);

-- Link orders to the quote used to create them.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES pricing_quotes(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_quote_id_unique
  ON orders(quote_id)
  WHERE quote_id IS NOT NULL;

-- RLS
ALTER TABLE pricing_quotes ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access pricing_quotes" ON pricing_quotes
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE pricing_quotes IS 'Server-calculated locked pricing quotes with TTL for checkout/order creation';
