-- Track one-time acceptance of Terms/Privacy for account registration flows
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

COMMENT ON COLUMN public.user_profiles.terms_accepted_at IS
  'Timestamp when user accepted Terms and Privacy policy';
