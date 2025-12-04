# Figma Assets Management

## Problem Solved
Figma API asset URLs expire after 7 days. This system moves all assets to local storage (`/public/assets/`) for permanent, fast access.

## Architecture

### Directory Structure
```
public/assets/
├── certifications/
│   ├── epd.png                  # EPD certification logo
│   ├── fsc.png                  # FSC certification logo
│   └── es-parama.png            # ES Parama certification logo
├── payments/
│   ├── mastercard.svg           # Mastercard logo
│   ├── visa.svg                 # Visa logo
│   ├── maestro.svg              # Maestro logo
│   ├── stripe.svg               # Stripe logo
│   └── paypal.svg               # PayPal logo
└── projects/
    ├── project-1.jpg            # Project gallery images
    ├── project-2.jpg
    └── ...
```

### Asset Management Files
- **`lib/assets/figma-assets.ts`** - Central TypeScript file with all asset paths
- **`scripts/download-assets.py`** - Python script to download assets from Figma
- **`scripts/download-figma-assets.js`** - Node.js alternative

## Usage

### Option 1: Download Assets (Python - Recommended)

#### Prerequisites
```bash
pip install requests tqdm
```

#### Run Download
```bash
python scripts/download-assets.py
```

Output:
```
ℹ Assets directory: c:\yakiwood-website\public\assets
ℹ Total assets to download: 15

ℹ Downloading certifications/epd.png...
✓ epd.png (42.3 KB)
...

============================================================
DOWNLOAD SUMMARY
============================================================
✓ Successful: 15
✗ Failed: 0
============================================================
```

### Option 2: Download Assets (Node.js)

```bash
node scripts/download-figma-assets.js
```

## Using Assets in Code

### In Components
```tsx
import { certifications, payments } from '@/lib/assets/figma-assets';

export function Footer() {
  return (
    <div>
      {/* Certification logos */}
      <img src={certifications.epd} alt="EPD" />
      <img src={certifications.fsc} alt="FSC" />
      <img src={certifications.esParama} alt="ES Parama" />
      
      {/* Payment method logos */}
      <img src={payments.mastercard} alt="Mastercard" />
      <img src={payments.visa} alt="Visa" />
      <img src={payments.stripe} alt="Stripe" />
    </div>
  );
}
```

### Asset Keys Available
```typescript
// Certifications
certifications.epd              // '/assets/certifications/epd.png'
certifications.fsc              // '/assets/certifications/fsc.png'
certifications.esParama         // '/assets/certifications/es-parama.png'

// Payments
payments.mastercard             // '/assets/payments/mastercard.svg'
payments.visa                   // '/assets/payments/visa.svg'
payments.maestro                // '/assets/payments/maestro.svg'
payments.stripe                 // '/assets/payments/stripe.svg'
payments.paypal                 // '/assets/payments/paypal.svg'

// Projects (image gallery)
projectAssets.gallery           // Array of project images

// About page
aboutAssets.team                // Array of team member photos
aboutAssets.video               // Video background URL

// Header/Navigation
headerIcons.logo                // Logo SVG
headerIcons.cart                // Cart icon
```

## Refreshing Assets from Figma

When Figma designs are updated:

1. **Export from Figma MCP**
   ```bash
   # Use mcp_figma2_get_design_context with:
   # - fileKey: ttxSg4wMtXPqfcQEh6B405
   # - Get fresh asset URLs
   ```

2. **Update figma-assets.ts**
   - Copy new asset URLs from MCP response
   - Update the URLs in `lib/assets/figma-assets.ts`
   - Keep local paths for items that are already downloaded

3. **Download New Assets**
   ```bash
   python scripts/download-assets.py
   ```

## Performance Benefits

| Approach | Pros | Cons |
|----------|------|------|
| **Figma API URLs** | Always fresh, no storage needed | Expires after 7 days, slow loading, depends on Figma uptime |
| **Local Storage** | Fast loading, permanent, no expiry | Requires download script, takes disk space (~5-10MB) |

### Speed Comparison
- Figma API URL: ~2-3s per image (through Figma CDN)
- Local asset: ~100-300ms (served from Next.js public directory)

## Asset Source Reference

All assets come from Figma design file: `ttxSg4wMtXPqfcQEh6B405`

Design sections:
- **Certifications** - Footer section (node: 717:6019)
- **Payment Methods** - Footer section (node: 766:9079)
- **Projects** - Projects page gallery (node: 606:10951)
- **About Page** - Hero, team, CTAs (node: 669:33381)
- **Header** - Logo, cart icon, announcement bar (node: 968:18486)

## Troubleshooting

### Download fails with "404 Not Found"
- URLs expire after 7 days
- Get fresh URLs from Figma MCP with `mcp_figma2_get_design_context`
- Update URLs in `figma-assets.ts`
- Try download again

### Assets not showing in browser
1. Verify files exist: `ls public/assets/`
2. Check browser console for 404 errors
3. Ensure `next.config.ts` has public path configured
4. Rebuild Next.js: `npm run build`

### Download is slow
- Check internet connection
- Reduce batch size (edit `FIGMA_ASSETS` in script)
- Run during off-peak hours

## Adding New Assets

To add a new asset:

1. Get its Figma URL from MCP
2. Add to `FIGMA_ASSETS` in `scripts/download-assets.py`
3. Add corresponding entry in `lib/assets/figma-assets.ts`
4. Run download script
5. Use in code via import

Example:
```typescript
// scripts/download-assets.py
FIGMA_ASSETS = {
    'solutions/solution-1.jpg': 'https://www.figma.com/api/mcp/asset/...',
    ...
}

// lib/assets/figma-assets.ts
export const solutionAssets = {
  solution1: '/assets/solutions/solution-1.jpg',
} as const;

// In component
<img src={solutionAssets.solution1} alt="Solution" />
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/build.yml`:
```yaml
- name: Download Figma Assets
  run: python scripts/download-assets.py

- name: Upload assets to artifact
  uses: actions/upload-artifact@v3
  with:
    name: assets
    path: public/assets/
```

## Size & Bandwidth

Expected asset sizes:
- Certification logos: ~30-100 KB each
- Payment logos: ~5-20 KB each  
- Project images: ~200-500 KB each
- Total: ~5-10 MB for all assets

Recommended server setup:
- Enable gzip compression in Next.js
- Use CDN for production (Vercel Edge Network, CloudFront, etc)
- Set cache headers for long-term caching

## Questions?

For issues or questions about asset management, refer to:
- `lib/assets/figma-assets.ts` - Asset path definitions
- `scripts/download-assets.py` - Download mechanism
- Original Figma file: `ttxSg4wMtXPqfcQEh6B405`
