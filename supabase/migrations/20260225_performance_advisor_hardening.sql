-- ============================================================================
-- Migration: 20260225_performance_advisor_hardening.sql
-- Description: Fix Supabase performance advisor findings (FK indexes + RLS init plan)
-- ============================================================================

-- 1) Add covering indexes for foreign keys flagged by advisor
CREATE INDEX IF NOT EXISTS cart_items_configuration_id_idx
  ON public.cart_items (configuration_id);

CREATE INDEX IF NOT EXISTS cart_items_product_id_idx
  ON public.cart_items (product_id);

CREATE INDEX IF NOT EXISTS custom_configurations_product_id_idx
  ON public.custom_configurations (product_id);

CREATE INDEX IF NOT EXISTS inventory_alerts_resolved_by_idx
  ON public.inventory_alerts (resolved_by);

CREATE INDEX IF NOT EXISTS inventory_movements_performed_by_idx
  ON public.inventory_movements (performed_by);

CREATE INDEX IF NOT EXISTS order_items_configuration_id_idx
  ON public.order_items (configuration_id);

CREATE INDEX IF NOT EXISTS order_items_product_id_idx
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS product_3d_models_product_id_idx
  ON public.product_3d_models (product_id);

CREATE INDEX IF NOT EXISTS product_3d_models_profile_variant_id_idx
  ON public.product_3d_models (profile_variant_id);

-- 2) Replace row-by-row auth function calls in RLS policies with initplan style
DO $$
DECLARE
  p record;
  new_qual text;
  new_with_check text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        coalesce(qual, '') LIKE '%auth.uid()%'
        OR coalesce(with_check, '') LIKE '%auth.uid()%'
        OR coalesce(qual, '') LIKE '%auth.jwt()%'
        OR coalesce(with_check, '') LIKE '%auth.jwt()%'
      )
  LOOP
    new_qual := p.qual;
    new_with_check := p.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, 'auth\.jwt\(\)', '(select auth.jwt())', 'g');
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING (%s)',
        p.policyname,
        p.schemaname,
        p.tablename,
        new_qual
      );
    END IF;

    IF new_with_check IS NOT NULL THEN
      new_with_check := regexp_replace(new_with_check, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      new_with_check := regexp_replace(new_with_check, 'auth\.jwt\(\)', '(select auth.jwt())', 'g');
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK (%s)',
        p.policyname,
        p.schemaname,
        p.tablename,
        new_with_check
      );
    END IF;
  END LOOP;
END
$$;
