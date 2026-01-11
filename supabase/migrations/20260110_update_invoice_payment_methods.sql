-- Update allowed invoice payment methods
-- Expands invoices.payment_method to include: paypal, manual

ALTER TABLE IF EXISTS invoices
  DROP CONSTRAINT IF EXISTS invoices_payment_method_check;

ALTER TABLE IF EXISTS invoices
  ADD CONSTRAINT invoices_payment_method_check
  CHECK (payment_method IN ('bank_transfer','cash','card','stripe','paypal','manual'));
