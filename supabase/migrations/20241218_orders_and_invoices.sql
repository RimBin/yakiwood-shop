-- Užsakymų ir sąskaitų sistemos schemos

-- Orders table (užsakymai)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Order details
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT
);

-- Invoices table (sąskaitos faktūros)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Seller info (įmonės duomenys)
  seller_name TEXT NOT NULL,
  seller_company_code TEXT,
  seller_vat_code TEXT,
  seller_address TEXT NOT NULL,
  seller_city TEXT NOT NULL,
  seller_postal_code TEXT,
  seller_country TEXT NOT NULL DEFAULT 'Lietuva',
  seller_phone TEXT,
  seller_email TEXT,
  seller_bank_name TEXT,
  seller_bank_account TEXT,
  
  -- Buyer info (pirkėjo duomenys)
  buyer_name TEXT NOT NULL,
  buyer_company_name TEXT,
  buyer_company_code TEXT,
  buyer_vat_code TEXT,
  buyer_address TEXT NOT NULL,
  buyer_city TEXT NOT NULL,
  buyer_postal_code TEXT,
  buyer_country TEXT NOT NULL DEFAULT 'Lietuva',
  buyer_phone TEXT,
  buyer_email TEXT,
  
  -- Invoice items
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'cancelled')),
  
  -- Dates
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- Payment
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash', 'card', 'stripe')),
  
  -- Additional
  notes TEXT,
  pdf_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice PDF files (sąskaitų PDF failai)
CREATE TABLE IF NOT EXISTS invoice_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'application/pdf',
  storage_path TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_email ON invoices(buyer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_files_invoice_id ON invoice_files(invoice_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders via email
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

-- Policy: Users can view their own invoices via email
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (buyer_email = auth.jwt() ->> 'email');

-- Policy: Service role can do everything (for webhooks, admin)
CREATE POLICY "Service role full access orders" ON orders
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoices" ON invoices
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoice_files" ON invoice_files
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE orders IS 'E-commerce užsakymai su Stripe integracija';
COMMENT ON TABLE invoices IS 'Automatiškai generuojamos sąskaitos faktūros';
COMMENT ON TABLE invoice_files IS 'PDF sąskaitų failai (Vercel Blob arba Supabase Storage)';
