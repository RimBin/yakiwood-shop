# Admin Product Management - Quick Start

## ✅ Files Created

### Pages (Server Components)
- [app/admin/products/page.tsx](../app/admin/products/page.tsx) - Products list with auth
- [app/admin/products/new/page.tsx](../app/admin/products/new/page.tsx) - New product page
- [app/admin/products/[id]/page.tsx](../app/admin/products/[id]/page.tsx) - Edit product page

### Components (Client)
- [components/admin/ProductsAdminClient.tsx](../components/admin/ProductsAdminClient.tsx) - Products table & bulk actions
- [components/admin/ProductForm.tsx](../components/admin/ProductForm.tsx) - Comprehensive form with variants

### API Routes
- [app/api/admin/products/[id]/route.ts](../app/api/admin/products/[id]/route.ts) - GET, PUT, DELETE

## 🚀 Quick Setup (5 minutes)

### 1. Environment Variables
Add to `.env.local`:
```bash
ADMIN_EMAILS=your-email@example.com
```

### 2. Supabase Storage
Create product images bucket:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);
```

### 3. Test Access
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/admin/products
3. Login with admin email
4. Create test product

## 📋 Feature Checklist

### Products List Page
- ✅ Server-side authentication check
- ✅ Fetch products with variants from Supabase
- ✅ Responsive table with product details
- ✅ Search by name/slug
- ✅ Filter by category and status
- ✅ Bulk selection and actions (delete, publish/unpublish)
- ✅ Individual actions (edit, view, duplicate, delete)

### Product Form
- ✅ Name (LT and EN)
- ✅ Auto-generated slug (editable)
- ✅ Description (LT and EN, textarea)
- ✅ Category dropdown (4 options)
- ✅ Wood type dropdown (4 options)
- ✅ Base price (EUR)
- ✅ Status (draft/published)
- ✅ Stock quantity
- ✅ SKU
- ✅ Dimensions (width, height, depth, weight)
- ✅ Image upload with preview
- ✅ Variants (colors and finishes)
- ✅ Variant modal form
- ✅ Zod validation
- ✅ Save as draft / Publish
- ✅ Delete confirmation modal

### Variants Management
- ✅ Add color variants (name, hex code, price modifier)
- ✅ Add finish variants (name, description, price modifier)
- ✅ Edit existing variants
- ✅ Delete variants
- ✅ Variant availability toggle

### API Routes
- ✅ GET - Fetch single product with variants
- ✅ PUT - Update product and variants
- ✅ DELETE - Soft delete (archive)
- ✅ Admin authentication check
- ✅ Proper error handling

### Security
- ✅ Admin-only access via email check
- ✅ Server-side authentication
- ✅ Supabase RLS-ready
- ✅ Input validation with Zod

## 🎨 Design System

All components follow Yakiwood design guidelines:
- **Font**: DM Sans (weights: 300, 400, 500)
- **Colors**: #161616 (black), #E1E1E1 (grey), #FAFAFA (bg)
- **Buttons**: rounded-[100px]
- **Cards**: rounded-lg with shadow
- **Responsive**: Mobile-first with Tailwind

## 📱 Routes

- `/admin/products` - List all products
- `/admin/products/new` - Create new product
- `/admin/products/[id]` - Edit product

## 🔐 Authentication Flow

```
User visits /admin/products
  ↓
Server checks auth (Supabase session)
  ↓
Check email in ADMIN_EMAILS
  ↓
If not admin → redirect to /
If admin → show products
```

## 💾 Data Flow

### Create Product
```
User fills form → Upload image → Save to Supabase
  ↓
Create product record
  ↓
Create variant records
  ↓
Redirect to /admin/products
```

### Update Product
```
Load product + variants → User edits → Save changes
  ↓
Update product record
  ↓
Delete removed variants
  ↓
Update/insert variants
  ↓
Refresh page
```

## 🐛 Common Issues

### "Admin access denied"
**Solution**: Add your email to `ADMIN_EMAILS` in `.env.local`

### Images not uploading
**Solution**: Create `product-images` bucket in Supabase Storage

### TypeScript errors
**Solution**: Run `npm install --legacy-peer-deps zod`

### Products not appearing
**Solution**: Check `is_active` column in database

## 📚 Documentation

Full documentation: [ADMIN_PRODUCTS.md](./ADMIN_PRODUCTS.md)

## 🎯 Next Steps

### Optional Enhancements
- [ ] Add product image gallery (multiple images)
- [ ] Implement drag-and-drop for variant ordering
- [ ] Add CSV export/import
- [ ] Create product analytics dashboard
- [ ] Add SEO metadata fields
- [ ] Implement product tags
- [ ] Add related products selector

### Production Checklist
- [ ] Replace email check with proper RBAC
- [ ] Add Supabase RLS policies
- [ ] Implement audit logging
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Add automated tests
- [ ] Configure image CDN

## 🤝 Usage Tips

1. **Always save as draft first** - Test product before publishing
2. **Use descriptive slugs** - Auto-generated but editable
3. **Add variants strategically** - Each variant adds a purchase option
4. **Upload high-quality images** - First impression matters
5. **Set stock to 0 to mark out-of-stock** - Don't delete products

## 📞 Support

Need help? Check:
1. Browser console for errors
2. Supabase logs
3. Terminal for server errors
4. [Full documentation](./ADMIN_PRODUCTS.md)

---

**Created**: December 2025  
**Status**: ✅ Complete and functional  
**Dependencies**: Next.js 16, Supabase, Zod, Tailwind CSS
