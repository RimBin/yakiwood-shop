# Yakiwood Supabase Setup Automation Script
# This script will guide you through setting up Supabase for the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    YAKIWOOD SUPABASE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env.local exists
Write-Host "[1/7] Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local not found. Creating from template..." -ForegroundColor Red
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ Created .env.local from template" -ForegroundColor Green
}
Write-Host ""

# Step 2: Supabase Project Setup Instructions
Write-Host "[2/7] Supabase Project Setup" -ForegroundColor Yellow
Write-Host "Please complete these steps in Supabase Dashboard:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Click 'New Project'" -ForegroundColor White
Write-Host "3. Fill in:" -ForegroundColor White
Write-Host "   - Name: yakiwood-shop" -ForegroundColor Gray
Write-Host "   - Database Password: (choose secure password)" -ForegroundColor Gray
Write-Host "   - Region: Europe (closest to Lithuania)" -ForegroundColor Gray
Write-Host "4. Wait for project creation (~2 minutes)" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when your Supabase project is ready..." -ForegroundColor Cyan
Read-Host

# Step 3: Get Supabase Credentials
Write-Host ""
Write-Host "[3/7] Entering Supabase Credentials" -ForegroundColor Yellow
Write-Host "Go to: Project Settings > API" -ForegroundColor White
Write-Host ""

$supabaseUrl = Read-Host "Enter SUPABASE_URL (e.g., https://xxxxx.supabase.co)"
$supabaseAnonKey = Read-Host "Enter SUPABASE_ANON_KEY (starts with eyJ...)"
$supabaseServiceKey = Read-Host "Enter SUPABASE_SERVICE_ROLE_KEY (starts with eyJ...)"

Write-Host ""
Write-Host "✓ Credentials received" -ForegroundColor Green

# Step 4: Update .env.local
Write-Host ""
Write-Host "[4/7] Updating .env.local..." -ForegroundColor Yellow

$envContent = Get-Content ".env.local" -Raw
$envContent = $envContent -replace "NEXT_PUBLIC_SUPABASE_URL=.*", "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
$envContent = $envContent -replace "NEXT_PUBLIC_SUPABASE_ANON_KEY=.*", "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey"
$envContent = $envContent -replace "SUPABASE_SERVICE_ROLE_KEY=.*", "SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey"
Set-Content ".env.local" $envContent

Write-Host "✓ .env.local updated with Supabase credentials" -ForegroundColor Green

# Step 5: Database Migration Instructions
Write-Host ""
Write-Host "[5/7] Database Schema Setup" -ForegroundColor Yellow
Write-Host "Now we'll set up the database schema:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to: $supabaseUrl/project/default/editor" -ForegroundColor White
Write-Host "2. Click 'SQL Editor' in left sidebar" -ForegroundColor White
Write-Host "3. Click 'New Query'" -ForegroundColor White
Write-Host "4. Copy contents of: supabase\migrations\20241122_init_schema.sql" -ForegroundColor White
Write-Host "5. Paste into SQL Editor and click 'Run'" -ForegroundColor White
Write-Host "6. You should see 'Success. No rows returned'" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when migration is complete..." -ForegroundColor Cyan
Read-Host

Write-Host "✓ Database schema created" -ForegroundColor Green

# Step 6: Storage Bucket Setup
Write-Host ""
Write-Host "[6/7] Storage Bucket Setup" -ForegroundColor Yellow
Write-Host "Now we'll create the storage bucket for product images:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to: $supabaseUrl/project/default/storage/buckets" -ForegroundColor White
Write-Host "2. Click 'Create new bucket'" -ForegroundColor White
Write-Host "3. Fill in:" -ForegroundColor White
Write-Host "   - Name: product-images" -ForegroundColor Gray
Write-Host "   - Public bucket: YES (checked)" -ForegroundColor Gray
Write-Host "   - File size limit: 5 MB" -ForegroundColor Gray
Write-Host "   - Allowed MIME types: image/*" -ForegroundColor Gray
Write-Host "4. Click 'Create bucket'" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when bucket is created..." -ForegroundColor Cyan
Read-Host

Write-Host "✓ Storage bucket created" -ForegroundColor Green

# Step 7: Demo User Creation
Write-Host ""
Write-Host "[7/7] Demo User Setup" -ForegroundColor Yellow
Write-Host "Creating demo accounts for testing:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to: $supabaseUrl/project/default/auth/users" -ForegroundColor White
Write-Host "2. Click 'Add user' > 'Create new user'" -ForegroundColor White
Write-Host ""
Write-Host "   ADMIN USER:" -ForegroundColor Cyan
Write-Host "   - Email: admin@yakiwood.lt" -ForegroundColor Gray
Write-Host "   - Password: demo123456" -ForegroundColor Gray
Write-Host "   - Auto Confirm User: YES (checked)" -ForegroundColor Gray
Write-Host "   Click 'Create user'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Click 'Add user' again and create:" -ForegroundColor White
Write-Host ""
Write-Host "   REGULAR USER:" -ForegroundColor Cyan
Write-Host "   - Email: user@yakiwood.lt" -ForegroundColor Gray
Write-Host "   - Password: demo123456" -ForegroundColor Gray
Write-Host "   - Auto Confirm User: YES (checked)" -ForegroundColor Gray
Write-Host "   Click 'Create user'" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter when both users are created..." -ForegroundColor Cyan
Read-Host

# Run SQL to set user roles
Write-Host ""
Write-Host "Setting user roles in database..." -ForegroundColor White
Write-Host ""
Write-Host "1. Go back to SQL Editor: $supabaseUrl/project/default/editor" -ForegroundColor White
Write-Host "2. Click 'New Query'" -ForegroundColor White
Write-Host "3. Copy contents of: supabase\setup-demo-accounts.sql" -ForegroundColor White
Write-Host "4. Replace UUID placeholders with actual user IDs:" -ForegroundColor White
Write-Host "   - Get User IDs from Authentication > Users page" -ForegroundColor Gray
Write-Host "   - admin@yakiwood.lt UUID -> first UPDATE statement" -ForegroundColor Gray
Write-Host "   - user@yakiwood.lt UUID -> second UPDATE statement" -ForegroundColor Gray
Write-Host "5. Run the modified SQL" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when SQL is executed..." -ForegroundColor Cyan
Read-Host

Write-Host "✓ Demo users configured" -ForegroundColor Green

# Final Steps
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to: http://localhost:3000/login" -ForegroundColor White
Write-Host "3. Click 'Demo Login - Admin' or 'Demo Login - User'" -ForegroundColor White
Write-Host "4. Test the application!" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@yakiwood.lt / demo123456" -ForegroundColor Gray
Write-Host "  User:  user@yakiwood.lt / demo123456" -ForegroundColor Gray
Write-Host ""
Write-Host "Troubleshooting: See SUPABASE_SETUP.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""
