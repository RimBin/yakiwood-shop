-- ============================================================================
-- Migration: 20260225_security_advisor_hardening.sql
-- Description: Fix Supabase security advisor findings (RLS + function hardening)
-- ============================================================================

-- 1) Critical: RLS disabled on email_templates
ALTER TABLE IF EXISTS public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_admin_select" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_insert" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_update" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_delete" ON public.email_templates;

CREATE POLICY "email_templates_admin_select"
  ON public.email_templates
  FOR SELECT
  USING (is_admin());

CREATE POLICY "email_templates_admin_insert"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "email_templates_admin_update"
  ON public.email_templates
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "email_templates_admin_delete"
  ON public.email_templates
  FOR DELETE
  USING (is_admin());

REVOKE ALL ON public.email_templates FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;

-- 2) Warning: mutable function search_path
CREATE OR REPLACE FUNCTION public.set_chatbot_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3) Auth RLS init plan & cart policy hardening
-- Tighten cart access to authenticated users only at DB layer.
-- Anonymous carts are handled in frontend local state.

DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;

CREATE POLICY "cart_items_select_own"
  ON public.cart_items
  FOR SELECT
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "cart_items_insert_own"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "cart_items_update_own"
  ON public.cart_items
  FOR UPDATE
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "cart_items_delete_own"
  ON public.cart_items
  FOR DELETE
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND user_id = (SELECT auth.uid())
  );

REVOKE ALL ON public.cart_items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
