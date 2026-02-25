-- ============================================================================
-- Migration: 20260225_security_rls_no_policy_closure.sql
-- Description: Close "RLS Enabled No Policy" advisor findings with explicit
--              service-role-only policies.
-- ============================================================================

ALTER TABLE IF EXISTS public.chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chatbot_sessions_service_role_all" ON public.chatbot_sessions;
DROP POLICY IF EXISTS "chatbot_events_service_role_all" ON public.chatbot_events;
DROP POLICY IF EXISTS "invoice_files_service_role_all" ON public.invoice_files;

CREATE POLICY "chatbot_sessions_service_role_all"
  ON public.chatbot_sessions
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "chatbot_events_service_role_all"
  ON public.chatbot_events
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "invoice_files_service_role_all"
  ON public.invoice_files
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');
