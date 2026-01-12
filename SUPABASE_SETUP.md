# Supabase Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase Dashboard

## Step 1: Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
# Get these from Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Set admin emails:
```bash
ADMIN_EMAILS=admin@yakiwood.lt,your@email.com
```

4. Set storage bucket name:
```bash
SUPABASE_STORAGE_BUCKET=product-images
```

## Step 2: Run Database Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Run these SQL files **in order**:

### A. Initial Schema
```sql
-- Copy and paste contents of: supabase/migrations/20241122_init_schema.sql
```

### B. Catalog options + photo library (Required for Admin Options / Product photo library)
```sql
-- Copy and paste contents of: supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql
```

### B. Seed Data (Optional)
```sql
-- Copy and paste contents of: supabase/seed.sql
```

## Step 3: Create Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Click "New Bucket"
3. Name: `product-images`
4. Public bucket: **Yes** (for product images)
5. File size limit: 5 MB
6. Allowed MIME types: `image/jpeg, image/png, image/webp, image/avif`

### Storage Policies (RLS)

Run in SQL Editor:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow users to update their own uploads
CREATE POLICY "User Update Own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow admins to delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (auth.jwt() ->> 'email')::text = ANY(
    SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
  )
);
```

## Step 4: Create Demo Accounts

### A. Create Auth Users

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" (+ icon)
3. Create **Admin** account:
   - Email: `admin@yakiwood.lt`
   - Password: `demo123456`
   - Auto Confirm User: **Yes** ✓
4. Create **User** account:
   - Email: `user@yakiwood.lt`
   - Password: `demo123456`
   - Auto Confirm User: **Yes** ✓

### B. Set Up Profiles

1. Go to SQL Editor
2. Run: `supabase/setup-demo-accounts.sql`

This will:
- Add admin role to admin@yakiwood.lt
- Add user role to user@yakiwood.lt
- Create user profiles in database

## Step 5: Enable Row Level Security

Make sure RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- If any table has rowsecurity = false, enable it:
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

## Step 6: Test the Setup

### A. Test Database Connection

Create `test-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  // Test products table
  const { data, error } = await supabase.from('products').select('*').limit(5);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Products:', data);
  }
}

test();
```

Run: `node test-supabase.js`

### B. Test Demo Login

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/login`
3. Click "Admin" or "User" demo button
4. Should redirect to `/admin` or `/account`

### C. Test Product Images Upload

1. Login as admin
2. Go to admin panel
3. Try uploading a product image
4. Check Supabase Storage bucket for uploaded file

## Step 7: Production Checklist

Before deploying to production:

- [ ] Change demo account passwords
- [ ] Set strong SUPABASE_SERVICE_ROLE_KEY (never expose!)
- [ ] Configure CORS in Supabase Dashboard
- [ ] Set up custom domain for Supabase (optional)
- [ ] Enable email confirmations (Authentication > Settings)
- [ ] Configure SMTP for emails (optional)
- [ ] Set up Stripe webhooks (if using payments)
- [ ] Review and tighten RLS policies
- [ ] Enable database backups
- [ ] Set up monitoring/alerts

## Troubleshooting

### "Invalid API key" error
- Double-check `.env.local` has correct keys
- Restart dev server after changing env vars

### "Row Level Security policy violation"
- Make sure RLS policies are created for tables
- Check user role in `user_profiles` table

### Images not loading
- Verify bucket name matches `SUPABASE_STORAGE_BUCKET`
- Check storage policies allow public read
- Confirm bucket is set to public

### Demo login not working
- Verify users created in Authentication
- Check `setup-demo-accounts.sql` ran successfully
- Confirm email addresses match exactly

## Useful SQL Queries

### Check user roles
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users;
```

### List all products
```sql
SELECT * FROM products;
```

### Check storage usage
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(CAST(metadata->>'size' AS integer)) / 1024 / 1024 as total_mb
FROM storage.objects
GROUP BY bucket_id;
```

### Reset demo user passwords (via dashboard only)
Go to Authentication > Users > Click user > Reset Password

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: GitHub Issues

---

**Security Note**: Never commit `.env.local` to version control!
