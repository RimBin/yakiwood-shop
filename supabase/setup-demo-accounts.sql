-- Demo Accounts Setup for Yakiwood
-- Run this in Supabase SQL Editor after running the migrations

-- Note: Demo users need to be created through Supabase Authentication UI
-- or using the Supabase Admin API, as SQL cannot create auth users directly.
-- 
-- Follow these steps:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" and create:
--    - Email: admin@yakiwood.lt, Password: demo123456, Email Confirmed: Yes
--    - Email: user@yakiwood.lt, Password: demo123456, Email Confirmed: Yes
-- 
-- 3. After creating the users, run this script to set up their profiles:

-- Grant admin role to admin user
-- Replace 'ADMIN_USER_UUID' with the actual UUID from Authentication > Users
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@yakiwood.lt';

-- Ensure regular user has user role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"user"'
)
WHERE email = 'user@yakiwood.lt';

-- Create user profiles if they don't exist
INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Demo Admin' as full_name,
  'admin' as role,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'admin@yakiwood.lt'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();

INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Demo User' as full_name,
  'user' as role,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'user@yakiwood.lt'
ON CONFLICT (id) DO UPDATE SET
  role = 'user',
  updated_at = now();

-- Verify the setup
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  p.role as profile_role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE u.email IN ('admin@yakiwood.lt', 'user@yakiwood.lt');
