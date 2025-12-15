# Design Variables & Tokens - Yakiwood Website

> **Last Updated**: December 17, 2024  
> **Figma File**: ttxSg4wMtXPqfcQEh6B405  
> **Extraction**: 60+ page designs analyzed (homepage, products, cart, checkout, account, projects, about, privacy, etc.)

## Colors

### Background Colors
```css
--bg-black: #161616
--bg-white: #FFFFFF
--bg-grey: #E1E1E1
--bg-lighter-grey: #EAEAEA
--bg-wood: #E4E4E4
```

### Text Colors
```css
--text-black: #161616
--text-white: #FFFFFF
--text-dark-grey: #535353
--text-grey: #7C7C7C
--text-light-grey: #BBBBBB
```

### UI/System Colors
```css
--border-color: #BBBBBB
--system-red: #FB3333
--hover-overlay: rgba(22, 22, 22, 0.05)
--modal-backdrop: rgba(0, 0, 0, 0.5)
--footer-logo-bg: rgba(254, 254, 254, 0.1)
```

## Typography

### Font Families
```css
--font-dm-sans: 'DM Sans', sans-serif
--font-outfit: 'Outfit', sans-serif
--font-tiro-tamil: 'Tiro Tamil', serif
```

### Typography Scale (Desktop 1440px)

#### Headings
```typescript
// H1 - Page Titles
font-family: 'DM Sans', weight: 300 (Light)
font-size: 128px
line-height: 0.95 (121.6px)
letter-spacing: -6.4px (-5%)
text-transform: none
fontVariationSettings: "'opsz' 14"

// H2 (Hero Headlines)
font-family: 'DM Sans', weight: 400 (Regular)
font-size: 48px
line-height: 1.1 (52.8px)
letter-spacing: -0.96px (-2%)
fontVariationSettings: "'opsz' 14"

// H3 - Section Counters
font-family: 'DM Sans', weight: 400 (Regular)
font-size: 32px
line-height: 1.1 (35.2px)
letter-spacing: -1.28px (-4%)
fontVariationSettings: "'opsz' 14"

// H4 - Section Headings
font-family: 'DM Sans', weight: 400 (Regular)
font-size: 24px
line-height: 1.1 (26.4px)
letter-spacing: -0.96px (-4%)
fontVariationSettings: "'opsz' 14"

// H5 - Product Names, Card Titles
font-family: 'DM Sans', weight: 500 (Medium)
font-size: 18px
line-height: 1.2 (21.6px)
letter-spacing: -0.36px (-2%)
fontVariationSettings: "'opsz' 14"
```

#### Body & UI Text
```typescript
// Body Text / Small Text
font-family: 'Outfit', weight: 400 (Regular)
font-size: 12px
line-height: 1.3 (15.6px)
letter-spacing: 0px

// Button Title / Menu Items
font-family: 'Outfit', weight: 400 (Regular)
font-size: 12px
line-height: 1.2 (14.4px)
letter-spacing: 0.6px (5%)
text-transform: uppercase

// Subheading / Input Labels
font-family: 'Outfit', weight: 400 (Regular)
font-size: 12px
line-height: 1.3 (15.6px)
letter-spacing: 0.6px (5%)
text-transform: uppercase

// Light Text / Footer Links
font-family: 'Outfit', weight: 300 (Light)
font-size: 14px
line-height: 1.3 (18.2px)
letter-spacing: 0.14px (1%)
```

#### Accent & Special
```typescript
// Quote / Italic Accent
font-family: 'Tiro Tamil', weight: 400 (Regular), style: italic
font-size: 24px
line-height: 1.42 (34px)
letter-spacing: 0px

// Price
font-family: 'DM Sans', weight: 400 (Regular)
font-size: 16px
line-height: 1.2 (19.2px)
letter-spacing: -0.32px (-2%)
fontVariationSettings: "'opsz' 14"

// Copyright / Footer Small
font-family: 'DM Sans', weight: 500 (Medium)
font-size: 16px
line-height: 1.1 (17.6px)
letter-spacing: -0.64px (-4%)
fontVariationSettings: "'opsz' 14"
```

## Spacing System

### Component Gaps (from Figma code)
```css
--gap-xs: 4px      /* Small separators */
--gap-sm: 8px      /* Tight components */
--gap-md: 16px     /* Standard spacing */
--gap-lg: 24px     /* Section spacing */
--gap-xl: 32px     /* Large sections */
--gap-2xl: 40px    /* Page sections */
--gap-3xl: 64px    /* Hero sections */
--gap-200: 200px   /* Announcement bar items */
```

### Padding
```css
--p-xs: 8px
--p-sm: 10px       /* Button padding Y */
--p-md: 16px       /* Input/Card padding */
--p-lg: 24px       /* Cart summary, Filter chips */
--p-xl: 32px       /* Section padding */
--p-2xl: 40px      /* Container padding */
```

### Container Widths
```css
--container-mobile: 16px       /* Mobile edge margin */
--container-desktop: 40px      /* Desktop edge margin */
--max-width-layout: 1440px     /* Full layout width */
--max-width-form: 600px        /* Form containers */
--max-width-content: 838px     /* Content max-width */
```

## Border Radius

```css
--radius-button: 100px     /* Pill-shaped buttons */
--radius-card: 24px        /* Product/project cards */
--radius-input: 8px        /* Input fields, logo badges */
--radius-chip: 100px       /* Filter chips */
--radius-circle: 50%       /* Color swatches */
```

## Component Tokens

### Buttons

#### Primary Button (Black)
```css
background: #161616
color: #FFFFFF
padding: 10px 40px
border-radius: 100px
font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
text-transform: uppercase
height: 48px
```

#### Secondary Button (White)
```css
background: #FFFFFF
color: #161616
padding: 10px 40px
border-radius: 100px
font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
text-transform: uppercase
height: 48px
```

#### Link Button
```css
background: transparent
color: #161616
padding: 8px 0
font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
text-transform: uppercase
text-decoration: underline (on hover)
```

### Input Fields

#### Standard Input
```css
height: 48px
padding: 16px
border: 1px solid #BBBBBB
border-radius: 8px
background: transparent
font: 'Outfit' 12px/1.2, tracking: 0.6px
text-transform: uppercase
color: #161616
placeholder-color: #7C7C7C
```

#### Input Label
```css
font: 'Outfit' 12px/1.3, tracking: 0.6px
color: #7C7C7C
text-transform: uppercase
margin-bottom: 4px
```

#### Input with Eye Icon
```css
position: relative
.eye-icon {
  position: absolute
  right: 16px
  width: 24px
  height: 24px
}
```

### Filter Chips

#### Active State
```css
background: #161616
color: #FFFFFF
padding: 12px
border-radius: 100px
height: 32px
font: 'Outfit' 12px/1.3, letter-spacing: 0.6px
text-transform: uppercase
```

#### Inactive State
```css
background: transparent
color: #161616
border: 1px solid #BBBBBB
padding: 12px
border-radius: 100px
height: 32px
font: 'Outfit' 12px/1.3, letter-spacing: 0.6px
text-transform: uppercase
```

### Product Cards

#### E-shop Product Card
```css
.card {
  display: flex
  flex-direction: column
  gap: 8px
  width: 328px (desktop 4-col grid)
}
.card-image {
  height: 250px
  border: 0.3px solid #161616
  object-fit: cover
}
.card-title {
  font: 'DM Sans Medium' 18px/1.2, letter-spacing: -0.36px
  color: #161616
}
.card-price {
  font: 'DM Sans Regular' 16px/1.2, letter-spacing: -0.32px
  color: #535353
}
```

#### Catalog Grid Layout
```css
display: grid
grid-template-columns: repeat(4, 328px) /* Desktop 1440px */
gap: 16px (row) 16px (column)
padding: 40px
```

### Cart Components

#### Cart Card (Desktop)
```css
display: flex
gap: 24px
.cart-image {
  width: 168px
  height: 180px
}
.cart-content {
  width: 708px
  display: flex
  flex-direction: column
  gap: 34px
}
.cart-dimensions {
  font: 'Outfit' 12px/1.3
  color: #7C7C7C (label)
  color: #161616 (value)
}
.cart-qty-input {
  width: 153px
  height: 68px (includes label)
}
.cart-price {
  font: 'DM Sans Medium' 18px/1.2, letter-spacing: -0.36px
  color: #161616
}
```

#### Order Summary (Black Box)
```css
background: #161616
padding: 32px
display: flex
flex-direction: column
gap: 40px
width: 420px
.summary-title {
  font: 'DM Sans Regular' 24px/1.1, letter-spacing: -0.96px
  color: #FFFFFF
}
.summary-row {
  display: flex
  justify-content: space-between
  font: 'Outfit' 12px/1.3, letter-spacing: 0.6px
  color: #BBBBBB
  text-transform: uppercase
}
.summary-divider {
  width: 356px
  border-top: 1px solid #FFFFFF (opacity unknown)
}
```

#### Coupon Input Field
```css
width: 420px
height: 56px
padding: 16px 8px 16px 24px
border: 1px solid #BBBBBB
border-radius: 100px
display: flex
align-items: center
justify-content: space-between
.coupon-button {
  width: 118px
  height: 48px
  background: #161616
  color: #FFFFFF
  border-radius: 100px
}
```

### Announcement Bar

```css
background: #161616
width: 100%
height: 40px (desktop) / varies (mobile)
padding: 8px 40px
display: flex
align-items: center
justify-content: center
gap: 200px (desktop)
.announcement-item {
  display: flex
  gap: 8px
  align-items: center
}
.announcement-icon {
  width: 24px
  height: 24px
  color: #FFFFFF
}
.announcement-text {
  font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
  color: #FFFFFF
  text-transform: uppercase
}
```

### Header

#### Desktop Header
```css
height: 80px
padding: 16px 40px
border-bottom: 1px solid #BBBBBB
display: flex
align-items: center
justify-content: space-between
.header-logo {
  width: 126px
  height: 48px
}
.header-nav {
  display: flex
  gap: 40px
}
.header-nav-link {
  font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
  color: #161616
  text-transform: uppercase
}
.header-cart-button {
  border: 1px solid #535353
  padding: 10px 24px
  border-radius: 100px
  height: 48px
  display: flex
  gap: 8px
  align-items: center
}
.cart-badge {
  position: absolute
  top: 5px
  left: 37px
  background: #161616
  color: #FFFFFF
  width: 16px
  height: 16px
  border-radius: 50%
  font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
  text-transform: uppercase
  display: flex
  align-items: center
  justify-content: center
}
```

### Footer

```css
background: #161616
height: 606px
.footer-menu {
  display: flex
  gap: varies
  padding: 55px 40px (calculated from inset percentages)
}
.footer-heading {
  font: 'DM Sans Regular' 24px/1.1, letter-spacing: -0.96px
  color: #E1E1E1
}
.footer-link {
  font: 'Outfit Light' 14px/1.3, letter-spacing: 0.14px
  color: #BBBBBB
}
.footer-copyright {
  font: 'DM Sans Medium' 16px/1.1, letter-spacing: -0.64px
  color: #E1E1E1
}
.footer-logo-badge {
  width: 104px
  height: 104px
  background: rgba(254, 254, 254, 0.1)
  border-radius: 8px
  padding: 10px
}
.footer-payment-logos {
  display: flex
  gap: 24.39px
}
```

### Account Page

#### Account Menu (Mobile Sidebar)
```css
.account-nav {
  display: flex
  flex-direction: column
  gap: 0
  font: 'Outfit' 12px/1.2, letter-spacing: 0.6px
}
.account-nav-item {
  padding: 16px (estimated)
  text-transform: uppercase
  color: #161616
}
.account-nav-item.logout {
  color: #FB3333
}
```

#### Account Form Sections
```css
.form-section-heading {
  font: 'Outfit' 12px/1.3, letter-spacing: 0.6px
  color: #161616
  text-transform: uppercase
  margin-bottom: 16px
}
.form-row {
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 16px
}
.form-buttons {
  display: flex
  gap: 16px
  .cancel-button {
    background: transparent
    border: 1px solid #161616
  }
  .save-button {
    background: #161616
    color: #FFFFFF
  }
}
```

## Page-Specific Layouts

### Product Catalog
```css
.catalog-cover {
  padding: 32px 40px
  border-bottom: 1px solid #BBBBBB
  .catalog-title {
    font: 'DM Sans Light' 128px/0.95, letter-spacing: -6.4px
    color: #161616
  }
  .catalog-count {
    font: 'DM Sans Regular' 32px/1.1, letter-spacing: -1.28px
    color: #161616
  }
}
.catalog-filters {
  padding: 24px 40px
  background: #E1E1E1
  display: flex
  gap: 8px
}
.catalog-grid {
  padding: 40px
  display: grid
  grid-template-columns: repeat(4, 328px)
  gap: 16px
}
.load-more-button {
  margin: 40px auto
  width: 296px
}
```

### Cart Page
```css
.cart-cover {
  padding: 32px 40px
  border-bottom: 1px solid #BBBBBB
  display: flex
  gap: 15px
  .cart-title {
    font: 'DM Sans Light' 128px/0.95, letter-spacing: -6.4px
  }
  .cart-count {
    font: 'DM Sans Regular' 32px/1.1, letter-spacing: -1.28px
  }
}
.cart-layout {
  display: grid
  grid-template-columns: 900px 420px
  gap: 40px
  padding: 40px
}
.cart-items {
  display: flex
  flex-direction: column
  gap: 16px
}
.cart-divider {
  width: 100%
  border-top: 1px solid (unknown color, likely #BBBBBB)
}
```

### Homepage
```css
.hero-section {
  height: 776px
  position: relative
  background: cover, center
}
.section-padding {
  padding: 60px 40px (estimated from gaps)
}
.section-title {
  margin-bottom: 64px
  .section-label {
    font: 'DM Sans Regular' 16px/1.1, letter-spacing: -0.64px
    color: #161616
  }
  .section-heading {
    font: 'DM Sans Light' 64px/1.1, letter-spacing: -3.2px
    color: #161616
  }
}
```

## Responsive Breakpoints

Based on analyzed designs:
```css
--breakpoint-mobile: 390px   /* Mobile designs found */
--breakpoint-tablet: 768px   /* Not explicitly found, interpolate */
--breakpoint-desktop: 1440px /* Desktop designs found */
```

## Icon Sizes

```css
--icon-xs: 16px     /* Badge counter */
--icon-sm: 24px     /* Input icons, cart icon */
--icon-md: 32px     /* (not found, placeholder) */
--icon-lg: 48px     /* Logo height */
--icon-xl: 100px    /* CTA play button */
```

## Certification Logos

Footer logos use consistent sizing:
```css
width: 104px
height: 104px
background: rgba(254, 254, 254, 0.1)
border-radius: 8px
padding: 10px
```

Individual logo asset sizes vary (FSC: 71x80px, EPD: 80x41px, etc.)

## Payment Logos

```css
.payment-logos {
  display: flex
  gap: 24.39px
  height: 25px (max height)
}
/* Individual widths vary:
   Mastercard: 35.366px
   Visa: 35.366px
   Maestro: 40.1px
   Stripe: 53px
   PayPal: 56.594px
*/
```

## Z-Index Layers

```css
--z-base: 0
--z-dropdown: 10
--z-sticky: 100
--z-fixed: 200
--z-modal-backdrop: 1000
--z-modal: 1001
--z-popover: 1002
--z-toast: 1003
```

## Animation / Transitions

Not explicitly found in static Figma, but recommend:
```css
--transition-fast: 150ms ease-in-out
--transition-base: 200ms ease-in-out
--transition-slow: 300ms ease-in-out
--transition-drawer: 400ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Notes

1. **Font Variation Settings**: DM Sans uses `fontVariationSettings: "'opsz' 14"` across all variants.
2. **Border Widths**: Most borders are `1px solid`, product card images use `0.3px solid #161616`.
3. **Text Transform**: Buttons, labels, menu items use `text-transform: uppercase`.
4. **Object Fit**: Product images use `object-fit: cover` with `object-position: 50% 50%`.
5. **Asset Expiry**: Figma asset URLs expire after 7 days; move critical assets to `public/` folder.
6. **Incomplete Data**: Modal overlays, hover states, active states not fully documented (require interactive prototypes).

---

**Implementation Priority:**
1. ✅ Core colors (complete)
2. ✅ Typography system (complete)
3. ✅ Spacing/layout (complete from code)
4. ✅ Component tokens (buttons, inputs, cards extracted)
5. ⏳ Interactive states (hover, active, focus - need design review)
6. ⏳ Animations (not specified in Figma)

**Related Files:**
- `lib/design-system/tokens.ts` - Design system constants
- `tailwind.config.cjs` - Tailwind configuration
- `components/ui/Typography.tsx` - Typography component system
