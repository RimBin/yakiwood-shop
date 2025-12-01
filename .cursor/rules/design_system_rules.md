# Yakiwood Design System Rules for Figma MCP Integration

> **Figma File**: `ttxSg4wMtXPqfcQEh6B405`  
> **Purpose**: Guidelines for AI agents to correctly implement Figma designs using MCP tools

---

## 1. Token Definitions

### Location
- **Primary**: `lib/design-system.ts` - TypeScript constants with design tokens
- **Tailwind Config**: `tailwind.config.cjs` - Extended Tailwind theme with tokens
- **Documentation**: `DESIGN_SYSTEM.md` - Human-readable reference

### Format & Structure
```typescript
// lib/design-system.ts
export const colors = {
  text: { black: '#161616', grey: '#7C7C7C', ... },
  background: { black: '#161616', grey: '#E1E1E1', ... },
  ui: { lightGrey: '#BBBBBB', error: '#F63333' },
} as const;

export const typography = {
  h1: { fontFamily: 'DM Sans', fontWeight: 300, fontSize: '128px', ... },
  subheading: { fontFamily: 'Outfit', fontWeight: 400, fontSize: '12px', ... },
} as const;
```

### Token Transformation
**CRITICAL**: Do NOT transform tokens. Use exact Figma values:
```tsx
// ✅ CORRECT - Exact Figma values
className="text-[#161616] text-[128px] tracking-[-6.4px]"

// ❌ WRONG - Approximated/transformed
className="text-black text-9xl tracking-tight"
```

---

## 2. Component Library

### Location
- **Components**: `components/` directory
- **Pages**: `app/` directory (Next.js App Router)

### Component Architecture
- **Framework**: React 19 with TypeScript
- **Pattern**: Functional components with hooks
- **Client Components**: Use `'use client'` directive when needed (forms, interactivity)
- **Server Components**: Default in App Router

### Component Pattern Example
```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageCover, PageSection, PageLayout } from './PageLayout';

export default function ComponentName() {
  const [state, setState] = useState('');
  
  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page title cover */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] text-[#161616] tracking-[-6.4px]">
          Page Title
        </h1>
      </PageCover>
      
      {/* Content section */}
      <PageSection centered>
        {/* Your content here */}
      </PageSection>
    </section>
  );
}
```

### Layout Components (ALWAYS USE THESE)
```tsx
// components/PageLayout.tsx provides:

1. PageCover - For page titles with border-bottom
   <PageCover>
     <h1>Title</h1>
   </PageCover>

2. PageSection - For content sections
   <PageSection centered> // centered = flex items-center
     <p>Content</p>
   </PageSection>

3. PageLayout - Generic 1440px wrapper
   <PageLayout>
     <div>Any content</div>
   </PageLayout>
```

### No Storybook
- Components are documented in `DESIGN_SYSTEM.md`
- Testing via Jest + React Testing Library

---

## 3. Frameworks & Libraries

### UI Framework
- **React 19** (latest)
- **Next.js 14+** with App Router
- **TypeScript** (strict mode enabled)

### Styling Framework
- **Tailwind CSS 4** (via PostCSS plugin)
- **NO tailwind.config.js by default** - use inline utilities
- **Inline arbitrary values**: `text-[#161616]`, `text-[128px]`, `tracking-[-6.4px]`

### Build System
- **Next.js compiler** (built-in)
- **PostCSS** for Tailwind processing
- **Dev**: `npm run dev` (port 3000, fallback 3020)
- **Build**: `npm run build`

---

## 4. Asset Management

### Storage Locations
1. **Figma Assets** (temporary - 7 days):
   ```typescript
   const imgUrl = "https://www.figma.com/api/mcp/asset/[uuid]";
   ```

2. **Public Directory** (permanent):
   ```
   public/
     images/
     icons/
     videos/
   ```

### Asset Usage Pattern
```tsx
// Temporary Figma assets (for development)
<img src="https://www.figma.com/api/mcp/asset/..." alt="" />

// Production assets (move to public/)
<Image 
  src="/images/logo.png" 
  alt="Yakiwood" 
  width={126} 
  height={48}
/>
```

### CDN Configuration
- **Figma domains** allowed in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'www.figma.com' },
  ],
}
```

### Optimization
- Use Next.js `<Image>` component for optimization
- Assets expire in 7 days - migrate to `public/` for production

---

## 5. Icon System

### Current State
- **No dedicated icon system** yet
- Icons embedded as SVG in Figma assets
- Inline SVG for custom icons (checkmarks, etc.)

### Icon Pattern
```tsx
// Inline SVG
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="..." stroke="currentColor" />
</svg>

// Figma extracted icon
const iconUrl = "https://www.figma.com/api/mcp/asset/...";
<img src={iconUrl} alt="" className="size-[24px]" />
```

### Future: Icon Library
- Consider `react-icons` or custom icon component library
- Extract common icons to `/public/icons/`

---

## 6. Styling Approach

### CSS Methodology
**Inline Tailwind Utilities** - NO CSS Modules, NO Styled Components

### Critical Rules
1. **Use exact Figma values** - no approximations
2. **Font syntax**: `font-['DM_Sans']` or `font-['Outfit']`
3. **Colors**: Always use hex values `text-[#161616]`
4. **Sizes**: Use pixel values `text-[128px]`, `h-[48px]`
5. **Spacing**: Exact values `gap-[24px]`, `px-[40px]`
6. **Font variation**: Add for DM Sans:
   ```tsx
   style={{ fontVariationSettings: "'opsz' 14" }}
   ```

### Global Styles
- **Location**: `app/globals.css`
- **Purpose**: Font face definitions, CSS resets
- **DO NOT** add component styles here

### Responsive Design
```tsx
// Mobile-first approach
className="
  text-[56px]        // Mobile: 56px
  md:text-[128px]    // Desktop: 128px
  px-[16px]          // Mobile: 16px
  md:px-[40px]       // Desktop: 40px
"
```

### Common Patterns
```tsx
// Container padding
px-[16px] md:px-[40px]

// Section spacing
pt-[32px] pb-[32px]          // Small
pt-[80px] md:pt-[120px]      // Large

// Form field gap
gap-[4px]   // Label to input
gap-[24px]  // Between fields

// Component gaps
gap-[8px]   // Icon to text
gap-[40px]  // Navigation items
```

---

## 7. Project Structure

### Directory Organization
```
yakiwood-website/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout (fonts, providers)
│   ├── page.tsx           # Homepage
│   ├── contact/           # Contact page
│   ├── produktai/         # Products (Lithuanian)
│   ├── products/          # Products (English)
│   └── api/               # API routes
│       └── checkout/      # Stripe checkout
├── components/            # React components
│   ├── Header.tsx         # Site header
│   ├── Footer.tsx         # Site footer
│   ├── Contact.tsx        # Contact form
│   ├── Products.tsx       # Product listing
│   └── ...
├── lib/                   # Utilities and config
│   ├── design-system.ts   # Design tokens
│   ├── cart/             
│   │   └── store.ts       # Zustand cart store
│   └── supabase/          # Database client (disabled)
├── messages/              # i18n translations
│   └── lt.json           # Lithuanian (currently en.json needed)
├── public/                # Static assets
├── __mocks__/             # Jest mocks
└── [config files]
```

### Feature Organization Pattern
- **Page components**: `app/[route]/page.tsx`
- **Reusable components**: `components/ComponentName.tsx`
- **State management**: `lib/[feature]/store.ts`
- **Types**: Inline or co-located `types.ts`

---

## 8. Figma MCP Integration Workflow

### Step 1: Extract Design Context
```bash
# Get design code + assets
mcp_figma2_get_design_context(
  fileKey="ttxSg4wMtXPqfcQEh6B405",
  nodeId="669:33690"
)
```

### Step 2: Convert to Project Patterns
**CRITICAL CONVERSIONS**:

1. **Remove Figma-generated wrappers**:
   ```tsx
   // ❌ Figma generated (too complex)
   <div className="absolute inset-[...]" data-node-id="...">
   
   // ✅ Simplified for project
   <div className="px-[40px] pt-[32px]">
   ```

2. **Convert fonts**:
   ```tsx
   // ❌ Figma generated
   className="font-['DM_Sans:Light',sans-serif]"
   
   // ✅ Project pattern
   className="font-['DM_Sans'] font-light"
   style={{ fontVariationSettings: "'opsz' 14" }}
   ```

3. **Simplify colors**:
   ```tsx
   // ❌ Figma generated (CSS variables)
   style={{ "--fill-0": "rgba(22, 22, 22, 1)" }}
   
   // ✅ Project pattern
   className="bg-[#161616]"
   ```

4. **Semantic HTML**:
   ```tsx
   // ❌ Generic divs
   <div data-name="Button">
   
   // ✅ Semantic elements
   <button type="submit">
   ```

### Step 3: Add Interactivity
```tsx
// Figma gives static HTML - add React patterns:

// State management
const [formData, setFormData] = useState({...});

// Event handlers
const handleSubmit = async (e: React.FormEvent) => {...};

// Client directive
'use client';
```

### Step 4: Responsive Adjustments
```tsx
// Figma shows desktop (1440px) - add mobile:

className="
  text-[56px] md:text-[128px]    // Mobile + Desktop
  px-[16px] md:px-[40px]          // Mobile + Desktop
  hidden md:block                  // Desktop only
"
```

---

## 9. DO's and DON'Ts for MCP Implementation

### ✅ DO

1. **Use exact Figma pixel values**:
   ```tsx
   text-[128px] tracking-[-6.4px] leading-[0.95]
   ```

2. **Preserve font families**:
   ```tsx
   font-['DM_Sans'] font-light
   font-['Outfit'] font-normal
   ```

3. **Use hex colors directly**:
   ```tsx
   text-[#161616] bg-[#E1E1E1] border-[#BBBBBB]
   ```

4. **Add font variation for DM Sans**:
   ```tsx
   style={{ fontVariationSettings: "'opsz' 14" }}
   ```

5. **Include `uppercase` for subheadings/buttons**:
   ```tsx
   <label className="... uppercase">EMAIL ADDRESS</label>
   ```

6. **Use semantic HTML**:
   ```tsx
   <button>, <input>, <label>, <section>, <nav>
   ```

7. **Add `'use client'` for interactive components**

8. **Import Next.js components**:
   ```tsx
   import Link from 'next/link';
   import Image from 'next/image';
   ```

### ❌ DON'T

1. **Don't approximate sizes**:
   ```tsx
   ❌ text-9xl → ✅ text-[128px]
   ```

2. **Don't use Tailwind color names**:
   ```tsx
   ❌ text-black → ✅ text-[#161616]
   ```

3. **Don't keep Figma data attributes**:
   ```tsx
   ❌ data-node-id="669:33690" data-name="Cover"
   ```

4. **Don't use absolute positioning from Figma**:
   ```tsx
   ❌ absolute inset-[9.08%_44.38%_71.12%_2.78%]
   ✅ px-[40px] pt-[32px] pb-[32px]
   ```

5. **Don't keep Figma image constants**:
   ```tsx
   ❌ const img1 = "https://figma.com/api/mcp/..."
   ✅ Move to public/ or use dynamic imports
   ```

6. **Don't forget responsive breakpoints**:
   ```tsx
   ❌ text-[128px]
   ✅ text-[56px] md:text-[128px]
   ```

7. **Don't use generic CSS variable patterns**:
   ```tsx
   ❌ style={{ "--fill-0": "rgba(...)" }}
   ✅ className="fill-[#161616]"
   ```

---

## 10. Translation & Localization

### Current State
- **Single locale**: English (`en`)
- **next-intl** configured but simplified
- **Future**: Add Lithuanian (`lt`) localization

### i18n Pattern (when re-enabled)
```tsx
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations();
  
  return (
    <h1>{t('contact.title')}</h1>
  );
}
```

### Messages Structure
```json
// messages/en.json (needed)
{
  "nav": {
    "products": "Products",
    "contact": "Contact"
  },
  "contact": {
    "title": "Contact us"
  }
}
```

---

## 11. Testing

### Framework
- **Jest** + **React Testing Library**
- Config: `jest.config.cjs`, `jest.setup.ts`

### Test Pattern
```tsx
// components/Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Contact us')).toBeInTheDocument();
  });
});
```

### Run Tests
```bash
npm run test              # Single run
npm run test:watch        # Watch mode
```

---

## 12. Quick Reference Card

### Typography Classes
```tsx
// H1
font-['DM_Sans'] font-light text-[128px] leading-[0.95] tracking-[-6.4px]

// Big Text
font-['DM_Sans'] font-light text-[52px] leading-none tracking-[-2.08px]

// H4
font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px]

// Subheading (labels)
font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase

// Button
font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase

// Body Text
font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]
```

### Color Palette
```tsx
// Text
#161616  // Primary black
#7C7C7C  // Grey (labels)
#535353  // Dark grey (muted)
#FFFFFF  // White

// Backgrounds
#161616  // Black
#E1E1E1  // Grey (page bg)
#FFFFFF  // White

// UI
#BBBBBB  // Light grey (borders)
#F63333  // Error red
```

### Spacing
```tsx
px-[16px] md:px-[40px]  // Container
gap-[4px]                // Label → Input
gap-[8px]                // Icon → Text
gap-[24px]               // Form fields
gap-[40px]               // Nav items
pt-[32px]                // Section small
pt-[80px] md:pt-[120px] // Section large
```

---

**Last Updated**: November 30, 2025  
**Figma File**: https://www.figma.com/design/ttxSg4wMtXPqfcQEh6B405/
