# Yakiwood E-commerce Setup Guide

## Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project URL and anon key

### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Fill in your Supabase credentials from the dashboard:
# Settings > API > Project URL
# Settings > API > Project API keys > anon public
# Add service role + admin emails for CMS:
# SUPABASE_SERVICE_ROLE_KEY=service-role-key
# ADMIN_EMAILS=admin@example.com (comma separated list)
# SUPABASE_STORAGE_BUCKET=product-images
# RESEND_API_KEY=... (for emails)
```

### 3. Run Database Migrations
In your Supabase dashboard:
1. Go to **SQL Editor**
2. Copy contents of `supabase/migrations/20241122_init_schema.sql`
3. Run the migration
4. Copy contents of `supabase/seed.sql` 
5. Run the seed data

### Database Schema

**Tables:**
- `products` - Main product catalog (burnt wood types)
- `product_variants` - Colors, finishes, sizes for each product
- `custom_configurations` - Saved 3D configurations with selected options
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `cart_items` - Shopping cart (for logged-in users)

### 4. Test Connection
```typescript
// In any server component
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
```

## Next Steps

### E-commerce Features
- [ ] Product listing page with filters
- [ ] Individual product detail pages
- [ ] Shopping cart functionality
- [ ] Checkout flow

### 3D Configurator
- [ ] Install Three.js: `npm install three @react-three/fiber @react-three/drei`
- [ ] Create 3D viewer component
- [ ] Load GLB/GLTF models
- [ ] Texture/color switching
- [ ] Save configurations to database

### Stripe Integration
- [ ] Install Stripe: `npm install stripe @stripe/stripe-js`
- [ ] Set up Stripe account
- [ ] Configure webhook endpoints
- [ ] Implement checkout session
- [ ] Handle payment confirmations
Scaffold implementuotas.

```bash
npm install stripe @stripe/stripe-js zustand --legacy-peer-deps
```

`app/api/checkout/route.ts` sukuria Stripe Checkout sesiją iš krepšelio.

Environment kintamieji:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SITE_URL=https://jusu-domenas.lt
```

Norint realių kainų:
1. Sukurti Price objektus Stripe dashboard'e
2. DB lentelėje `products` pridėti stulpelį `stripe_price_id`
3. API route'e naudoti `line_items: [{price: product.stripe_price_id, quantity: ...}]`

Webhook'ai:
`/api/stripe/webhook` (sukursime vėliau) – apdoros `checkout.session.completed` ir įrašys užsakymą į DB.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## reCAPTCHA (Contact form)

Kontaktų formoje naudojamas Google reCAPTCHA v2 ("I'm not a robot" checkbox) apsaugai nuo spamo.

1. Sukurkite raktus: https://www.google.com/recaptcha/admin/create
2. Pasirinkite **reCAPTCHA v2** → **Checkbox**
3. Domenai (rekomenduojama pridėti):
  - `localhost` (development)
  - `shop.yakiwood.co.uk` (production)
4. Į `.env.local` įrašykite:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

Po pakeitimų perkraukite dev serverį (Ctrl+C → `npm run dev`).

## Deployment to Vercel

1. Push to GitHub (already done ✅)
2. Import project in Vercel dashboard
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Stripe keys (when ready)
4. Deploy!

Vercel will automatically detect Next.js and configure everything.
