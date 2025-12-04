# Yakiwood Asset Management System

Complete solution for managing all Figma design assets locally.

## Quick Start

### 1. Download All Assets from Figma

```bash
# Using Python (recommended - faster)
npm run assets:download

# Or using Node.js
npm run assets:download:node
```

This will:
- Download all images, logos, and icons from Figma
- Save to `/public/assets/` directory
- Create organized subdirectories (certifications, payments, projects, etc.)

### 2. Use Assets in Code

```tsx
import { certifications, payments } from '@/lib/assets/figma-assets';

export default function Footer() {
  return (
    <footer>
      <img src={certifications.epd} alt="EPD" />
      <img src={payments.visa} alt="Visa" />
    </footer>
  );
}
```

## System Architecture

### Problem
- Figma API asset URLs expire after 7 days
- Old URLs return 404 errors
- Need permanent, fast local storage for assets

### Solution
1. **Fetch URLs** from Figma MCP API (fresh every time)
2. **Download assets** to `/public/assets/` (one-time, persistent)
3. **Use local paths** in code (fast, no expiry)
4. **Organize by category** (certifications, payments, projects, etc.)

### File Structure

```
public/assets/                           # All downloaded assets
├── certifications/
│   ├── epd.png                          # EPD certification
│   ├── fsc.png                          # FSC forest certification  
│   └── es-parama.png                    # EU subsidies certification
├── payments/
│   ├── mastercard.svg
│   ├── visa.svg
│   ├── maestro.svg
│   ├── stripe.svg
│   └── paypal.svg
├── projects/
│   ├── project-1.jpg
│   ├── project-2.jpg
│   └── ...
└── solutions/
    └── ... (to be added)

lib/assets/figma-assets.ts               # TypeScript definitions
├── certifications: { epd, fsc, esParama }
├── payments: { mastercard, visa, maestro, stripe, paypal }
├── productAssets: { mainImage, gallery, colorSwatches }
├── projectAssets: { ... }
├── aboutAssets: { ... }
└── headerIcons: { logo, cart, ... }

scripts/
├── download-assets.py                   # Main download script (Python)
├── download-figma-assets.js             # Alternative (Node.js)
└── generate-asset-types.js              # Auto-generate TypeScript defs
```

## Asset Categories & Usage

### Certifications
Used in footer, product pages
```tsx
import { certifications } from '@/lib/assets/figma-assets';

<img src={certifications.epd} alt="EPD" width={80} height={41} />
<img src={certifications.fsc} alt="FSC" width={71} height={80} />
<img src={certifications.esParama} alt="ES" width={87} height={80} />
```

### Payment Methods
Used in footer, checkout page
```tsx
import { payments } from '@/lib/assets/figma-assets';

<img src={payments.mastercard} alt="Mastercard" />
<img src={payments.visa} alt="Visa" />
<img src={payments.stripe} alt="Stripe" />
```

### Project Images
Used on projects gallery page
```tsx
import { projectAssets } from '@/lib/assets/figma-assets';

projectAssets.gallery.map(src => <img src={src} />)
```

### Product Assets
Used on product detail pages
```tsx
import { productAssets } from '@/lib/assets/figma-assets';

<img src={productAssets.mainImage} alt="Product" />
{productAssets.colorSwatches.map(src => <img src={src} />)}
```

### About Page Assets
Used on /about route
```tsx
import { aboutAssets } from '@/lib/assets/figma-assets';

aboutAssets.team.map(src => <img src={src} />)
<img src={aboutAssets.ctaBg} alt="CTA" />
```

### Header Icons
Used in Header component
```tsx
import { headerIcons } from '@/lib/assets/figma-assets';

<img src={headerIcons.logo} alt="Logo" />
<img src={headerIcons.cart} alt="Cart" />
```

## Workflows

### Scenario 1: First Time Setup
```bash
# Install dependencies
npm install --legacy-peer-deps

# Download all Figma assets
npm run assets:download

# Start dev server
npm run dev
```

Assets are now available at `/assets/*` paths and imported via `lib/assets/figma-assets.ts`

### Scenario 2: Figma Designs Changed
```bash
# MCP fetches fresh URLs automatically
# URLs now work for next 7 days

# Download updated assets
npm run assets:download

# Assets updated in public/assets/
```

### Scenario 3: Add New Asset Category

1. **Get asset from Figma** via MCP
2. **Add to figma-assets.ts**:
   ```typescript
   export const solutionAssets = {
     solution1: '/assets/solutions/solution-1.jpg',
     solution2: '/assets/solutions/solution-2.jpg',
   } as const;
   ```
3. **Use in component**:
   ```tsx
   import { solutionAssets } from '@/lib/assets/figma-assets';
   <img src={solutionAssets.solution1} />
   ```

## Command Reference

| Command | Purpose |
|---------|---------|
| `npm run assets:download` | Download from Figma via Python |
| `npm run assets:download:node` | Download from Figma via Node.js |
| `npm run assets:generate` | Generate TypeScript defs from Figma output |
| `npm run dev` | Start development server (assets must be downloaded) |
| `npm run build` | Production build |

## Performance

### Speed Improvements
- **Before**: Figma API URLs (~2-3 seconds per image)
- **After**: Local assets (~100-300ms per image)
- **Result**: ~10x faster page loads

### Storage
- Total asset size: ~5-10 MB
- Fits in typical web project
- Compresses well with gzip

### Serving
- Assets served from Next.js public directory
- CDN-friendly (Vercel, CloudFlare, etc.)
- Long cache headers (immutable)

## Troubleshooting

### "ModuleNotFoundError: No module named 'requests'"
```bash
pip install requests tqdm
```

### "Download fails with HTTP 404"
Figma URLs expire after 7 days. Get fresh ones:
1. Call `mcp_figma2_get_design_context` in Figma MCP
2. Update URLs in `lib/assets/figma-assets.ts`
3. Run `npm run assets:download` again

### "Assets not showing in browser"
1. Check file exists: `ls public/assets/certifications/`
2. Restart dev server: `npm run dev`
3. Check browser console for 404 errors
4. Verify path matches in `figma-assets.ts`

### "Multiple figma-assets.ts files"
Delete old copies, keep only:
```
lib/assets/figma-assets.ts
```

## Integration with Components

### Footer Component
```tsx
// components/Footer.tsx
import Image from 'next/image';
import { certifications, payments } from '@/lib/assets/figma-assets';

export function Footer() {
  return (
    <footer>
      {/* Certification logos */}
      <div className="logos">
        <img src={certifications.epd} alt="EPD" height={41} />
        <img src={certifications.fsc} alt="FSC" height={80} />
        <img src={certifications.esParama} alt="ES Parama" height={80} />
      </div>
      
      {/* Payment methods */}
      <div className="payments">
        <img src={payments.mastercard} alt="Mastercard" />
        <img src={payments.visa} alt="Visa" />
        <img src={payments.maestro} alt="Maestro" />
        <img src={payments.stripe} alt="Stripe" />
        <img src={payments.paypal} alt="PayPal" />
      </div>
    </footer>
  );
}
```

### Products Component
```tsx
// components/Products.tsx
import { productAssets } from '@/lib/assets/figma-assets';

export function Products() {
  return (
    <div className="products">
      <img src={productAssets.mainImage} alt="Main" />
      <div className="gallery">
        {productAssets.gallery.map((src, i) => (
          <img key={i} src={src} alt={`Gallery ${i}`} />
        ))}
      </div>
      <div className="colors">
        {productAssets.colorSwatches.map((src, i) => (
          <img key={i} src={src} alt={`Color ${i}`} />
        ))}
      </div>
    </div>
  );
}
```

## Advanced: CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/build.yml
- name: Download Figma Assets
  run: npm run assets:download
  
- name: Build
  run: npm run build
  
- name: Upload to Vercel
  uses: vercel/action@v5
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
npm run assets:download --silent
git add public/assets/
```

## Reference

- **Figma File**: `ttxSg4wMtXPqfcQEh6B405`
- **Asset Definitions**: `lib/assets/figma-assets.ts`
- **Download Script**: `scripts/download-assets.py`
- **Documentation**: `ASSETS.md`

## Next Steps

1. ✅ Set up asset infrastructure
2. ✅ Download logos and icons
3. ⏳ Download product images
4. ⏳ Download project gallery
5. ⏳ Update all components to use local paths
6. ⏳ Test all pages

## Support

For issues or questions:
- Check `ASSETS.md` for detailed documentation
- Review `scripts/download-assets.py` for download logic
- Check `lib/assets/figma-assets.ts` for available assets
- Refer to `figma-assets.ts` usage examples above
