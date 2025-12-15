# Admin Product Management System

Complete admin interface for managing products in the Yakiwood e-commerce platform.

## Overview

This admin system provides comprehensive CRUD operations for products, including:
- Product creation and editing
- Multiple variants (colors and finishes)
- Image upload via Supabase Storage
- Bulk operations (delete, publish/unpublish)
- Search and filtering
- Lithuanian localization

## File Structure

```
app/
  admin/
    products/
      page.tsx              # Products list page (server component)
      new/
        page.tsx            # New product creation page
      [id]/
        page.tsx            # Edit product page
  api/
    admin/
      products/
        [id]/
          route.ts          # API routes: GET, PUT, DELETE

components/
  admin/
    ProductsAdminClient.tsx # Client-side products table & management
    ProductForm.tsx         # Comprehensive product form with variants
```

## Features

### 1. Products List Page (`/admin/products`)

**Features:**
- Server-side authentication check (redirects non-admins)
- Fetches products with variants from Supabase
- Responsive table with product details
- Search by name/slug
- Filter by category and status
- Bulk selection and actions
- Individual product actions (edit, view, duplicate, delete)

**Authentication:**
Admin access is determined by checking user email against `ADMIN_EMAILS` environment variable:
```env
ADMIN_EMAILS=admin@yakiwood.lt,manager@yakiwood.lt
```

### 2. Product Form (`/admin/products/new` & `/admin/products/[id]`)

**Form Sections:**

#### Basic Information
- Name (Lithuanian & English)
- Auto-generated slug (editable)
- Description (Lithuanian & English, textarea)
- Category dropdown (Fasadai, Lentos, Interjeras, Plytelės)
- Wood type (Pušis, Eglė, Ąžuolas, Maumedis)

#### Pricing & Inventory
- Base price (EUR)
- Stock quantity
- SKU code

#### Dimensions
- Width, Height, Depth (mm)
- Weight (kg)

#### Images
- Single product image upload
- Preview before save
- Stored in Supabase Storage bucket: `product-images`

#### Variants
- Add multiple color variants (name, hex color, price adjustment)
- Add finish variants (name, description, price adjustment)
- Drag-to-reorder (not implemented - could be added)
- Edit or delete existing variants
- Each variant can be marked as available/unavailable

#### Publishing
- Status: Draft or Published
- Draft products only visible to admins
- Published products visible to all users

**Validation:**
Uses Zod schema for comprehensive validation:
```typescript
- Name: required, min 1 character
- Slug: required, lowercase, hyphens only
- Category: required
- Wood type: required
- Base price: required, must be positive number
- Stock: optional, must be non-negative
- Dimensions: optional, must be positive
```

### 3. API Routes

#### GET `/api/admin/products/[id]`
Fetch single product with variants.

**Response:**
```json
{
  "product": {
    "id": "uuid",
    "name": "Product name",
    "slug": "product-slug",
    "base_price": 89.99,
    "category": "cladding",
    "variants": [...]
  }
}
```

#### PUT `/api/admin/products/[id]`
Update product and variants.

**Request Body:**
```json
{
  "name": "Updated name",
  "base_price": 95.00,
  "variants": [
    {
      "id": "existing-uuid",  // Update existing
      "name": "Natural",
      "variant_type": "color",
      "hex_color": "#2d2419",
      "price_adjustment": 0
    },
    {
      // No id = create new
      "name": "Dark",
      "variant_type": "color",
      "hex_color": "#1a1410",
      "price_adjustment": 5.00
    }
  ]
}
```

#### DELETE `/api/admin/products/[id]`
Soft delete product (sets `is_active: false`).

**Response:**
```json
{
  "success": true,
  "message": "Product archived successfully"
}
```

## Database Schema

### Products Table
```sql
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_en TEXT,
  category TEXT,
  wood_type TEXT,
  base_price DECIMAL NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  sku TEXT,
  width DECIMAL,
  height DECIMAL,
  depth DECIMAL,
  weight DECIMAL,
  image TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Product Variants Table
```sql
product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  variant_type TEXT NOT NULL, -- 'color' or 'finish'
  hex_color TEXT,
  price_adjustment DECIMAL DEFAULT 0,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)
```

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=admin@example.com,manager@example.com
```

### 2. Supabase Storage Setup

Create a storage bucket for product images:
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Set up RLS policy (allow authenticated uploads)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public access for reading
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### 3. Database Tables

Run the seed SQL from `supabase/seed.sql` to create tables.

### 4. Install Dependencies

```bash
npm install --legacy-peer-deps zod
```

## Usage

### Access Admin Interface

1. Navigate to `/admin/products`
2. Log in with an admin email (must be in `ADMIN_EMAILS`)
3. View all products with search and filtering

### Create New Product

1. Click "Naujas produktas" button
2. Fill in product details (name, category, price, etc.)
3. Upload product image
4. Add color/finish variants
5. Choose status (draft or published)
6. Click "Sukurti produktą"

### Edit Product

1. From products list, click "Redaguoti"
2. Modify any fields
3. Add/edit/delete variants
4. Click "Išsaugoti pakeitimus"

### Bulk Operations

1. Select multiple products using checkboxes
2. Use bulk action buttons:
   - "Publikuoti" - Set selected as published
   - "Nuimti" - Set selected as draft
   - "Ištrinti" - Soft delete (archive) selected

### Delete Product

Products are **soft deleted** (is_active set to false), not permanently removed. This preserves order history and data integrity.

## Security Considerations

**Current Implementation:**
- Simple email-based admin check
- Uses environment variable `ADMIN_EMAILS`
- Server-side validation on all routes

**Production Recommendations:**
1. Implement proper Role-Based Access Control (RBAC)
2. Use Supabase RLS policies for row-level security
3. Add `is_admin` column to users table
4. Validate JWT tokens in API routes
5. Add audit logging for admin actions
6. Rate limiting on admin endpoints

Example Supabase RLS policy:
```sql
CREATE POLICY "Only admins can modify products"
ON products FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  )
);
```

## Styling

**Design System:**
- Font: DM Sans (300, 400, 500 weights)
- Primary colors:
  - Black: #161616
  - Grey: #E1E1E1, #BBBBBB, #535353
  - Background: #FAFAFA, #EAEAEA
- Border radius: 8px (inputs), 24px (cards), 100px (buttons)
- Responsive: Mobile-first with Tailwind breakpoints

## Troubleshooting

### Products not appearing
- Check `is_active` status in database
- Verify Supabase connection
- Check browser console for errors

### Image upload failing
- Verify Supabase Storage bucket exists
- Check bucket policies allow uploads
- Ensure authenticated user session

### Admin access denied
- Verify email is in `ADMIN_EMAILS` env variable
- Check user is authenticated
- Restart dev server after env changes

### Variants not saving
- Check product ID is valid
- Verify variant data structure matches schema
- Check API route logs for errors

## Future Enhancements

- [ ] Image gallery (multiple images per product)
- [ ] Drag-and-drop variant reordering
- [ ] Product templates/duplication with variants
- [ ] Export products to CSV
- [ ] Import products from CSV
- [ ] Product analytics dashboard
- [ ] Inventory tracking and alerts
- [ ] SEO metadata fields
- [ ] Product tags system
- [ ] Related products selector
- [ ] Scheduled publishing
- [ ] Version history / audit trail

## API Reference

All admin API routes require authentication and admin privileges.

### List Products
Not yet implemented - use direct Supabase query in server component.

### Get Product
```
GET /api/admin/products/[id]
```

### Update Product
```
PUT /api/admin/products/[id]
Content-Type: application/json

{
  "name": "string",
  "base_price": number,
  "variants": [...],
  ...
}
```

### Delete Product
```
DELETE /api/admin/products/[id]
```

## Support

For issues or questions:
1. Check Supabase logs
2. Check browser console
3. Review server logs (terminal)
4. Check environment variables are set

---

**Note:** This admin system is designed for Lithuanian localization. All UI text is in Lithuanian. To add English admin interface, duplicate components and add translation keys via next-intl.
