# Assets Directory

This directory contains local copies of design assets to avoid dependency on expired Figma URLs.

## Required Assets

### Certifications (`certifications/`)
- `epd.png` - EPD certification logo (transparent background)
- `fsc.png` - FSC certification logo (transparent background)
- `es-parama.png` - ES Parama logo (white background)

### Payment Methods (`payments/`)
- `mastercard.svg` - Mastercard logo
- `visa.svg` - Visa logo
- `maestro.svg` - Maestro logo
- `stripe.svg` - Stripe logo
- `paypal.svg` - PayPal logo

### Products (`products/`)
Product images and color swatches will be stored here.

## How to Get Assets

### Option 1: From Figma (Recommended)
1. Open Figma file: `ttxSg4wMtXPqfcQEh6B405`
2. Select the asset/icon you need
3. Right-click → Export → PNG/SVG
4. Save to the appropriate subdirectory

### Option 2: Download from Brand Sites
- **Payment logos**: Official brand asset pages
  - Mastercard: https://brand.mastercard.com
  - Visa: https://usa.visa.com/about-visa/visa-brand.html
  - Stripe: https://stripe.com/newsroom/brand-assets
  - PayPal: https://www.paypal.com/us/webapps/mpp/logo-center

- **Certifications**:
  - EPD: https://www.environdec.com
  - FSC: https://fsc.org/en/logo-media-centre
  - ES Parama: https://esinvesticijos.lt

### Option 3: Temporary Placeholders
For development, you can use placeholder images from:
- https://placehold.co/200x200/png?text=EPD
- Create simple SVG logos with brand colors

## Image Specifications

### Certifications
- Format: PNG with transparency
- Size: 200x200px minimum
- Background: Transparent (except ES Parama - white)

### Payment Logos
- Format: SVG preferred, PNG acceptable
- Height: 20-30px
- Maintain aspect ratio
- Monochrome versions work best for footer

## Next.js Image Optimization

All images in `/public/assets/` are automatically optimized by Next.js when using the `<Image>` component.

No additional configuration needed - just place files in the correct subdirectories.
