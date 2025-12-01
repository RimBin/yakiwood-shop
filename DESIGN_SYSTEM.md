# Yakiwood Design System

> **Source of Truth**: Figma file `ttxSg4wMtXPqfcQEh6B405`  
> **Last synced**: November 30, 2025

This design system is automatically extracted from Figma and should be used as the single source of truth for all styling decisions.

## 📁 File Structure

```
lib/
  └── design-system.ts         # Design tokens (colors, typography, spacing)
tailwind.config.cjs             # Tailwind configuration with design tokens
```

## 🎨 Colors

### Text Colors
```typescript
import { colors } from '@/lib/design-system';

// Usage in components
text-[#161616]  // Text/Black - primary text
text-[#7C7C7C]  // Text/Grey - labels, secondary text
text-[#535353]  // Text/Dark-grey - muted text
text-[#FFFFFF]  // Text/White - text on dark backgrounds
```

### Background Colors
```typescript
bg-[#161616]    // Background/Black - dark sections, buttons
bg-[#E1E1E1]    // Background/Grey - page background
bg-[#FFFFFF]    // Background/White - cards, inputs
```

### UI Colors
```typescript
border-[#BBBBBB]  // Light-grey - borders, dividers
text-[#F63333]    // Error - required field asterisks
```

## ✍️ Typography

### Using Typography in Components

**Option 1: Direct Tailwind Classes (Recommended)**
```tsx
// H1 - Page titles
<h1 className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] tracking-[-6.4px]">
  Contact us
</h1>

// Big Text - Subtitles
<p className="font-['DM_Sans'] font-light text-[52px] leading-none tracking-[-2.08px]">
  Need assistance?
</p>

// Subheading - Labels, small uppercase text
<label className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase">
  EMAIL ADDRESS
</label>

// Button Title
<button className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
  SUBMIT
</button>

// Body Text
<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
  Regular body text
</p>
```

**Option 2: Design System Import**
```tsx
import { typography, getTypographyClasses } from '@/lib/design-system';

// Use the helper function
<h1 className={`${getTypographyClasses('h1')} text-[128px] leading-[0.95] tracking-[-6.4px]`}>
```

### Typography Scale

| Name | Family | Weight | Size | Line Height | Letter Spacing | Use Case |
|------|--------|--------|------|-------------|----------------|----------|
| **H1** | DM Sans | 300 | 128px | 0.95 | -6.4px | Page titles |
| **H4** | DM Sans | 400 | 24px | 1.1 | -0.96px | Section headings |
| **Big Text** | DM Sans | 300 | 52px | 1.0 | -2.08px | Subtitles |
| **Copyright** | DM Sans | 500 | 16px | 1.1 | -0.64px | Footer text |
| **Text** | Outfit | 300 | 14px | 1.2 | 0.14px | Body text |
| **Subheading** | Outfit | 400 | 12px | 1.3 | 0.6px | Labels (UPPERCASE) |
| **Btn Title** | Outfit | 400 | 12px | 1.2 | 0.6px | Buttons (UPPERCASE) |

## 📏 Spacing

### Container Padding
```tsx
// Mobile: 16px, Desktop: 40px
px-[16px] md:px-[40px]
```

### Section Spacing
```tsx
pt-[32px]   // Small sections
pt-[56px]   // Medium sections
pt-[80px]   // Large sections
pt-[120px]  // Extra large sections
```

### Component Gaps
```tsx
gap-[4px]   // Extra small - label to input
gap-[8px]   // Small - icon to text
gap-[16px]  // Medium - component spacing
gap-[24px]  // Large - form fields
gap-[40px]  // Extra large - navigation items
```

## 🧱 Components

### Input Fields
```tsx
<input
  className="
    h-[48px]
    border border-[#BBBBBB]
    bg-white
    px-[16px]
    font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase
    outline-none
    focus:border-[#161616]
    transition-colors
  "
/>
```

### Buttons
```tsx
<button
  className="
    h-[48px]
    px-[40px] py-[10px]
    bg-[#161616]
    rounded-[100px]
    font-['Outfit'] font-normal text-white text-[12px] tracking-[0.6px] uppercase
    hover:opacity-90
    transition-opacity
  "
>
  SUBMIT
</button>
```

### Checkboxes
```tsx
<button
  type="button"
  className={`
    w-[24px] h-[24px]
    border border-[#161616]
    flex items-center justify-center
    transition-colors
    ${checked ? 'bg-[#161616]' : ''}
  `}
>
  {/* Checkmark icon */}
</button>
```

## 📐 Layout

### Max Widths
```tsx
max-w-[1440px]  // Layout max width
max-w-[838px]   // Content max width (text blocks)
max-w-[600px]   // Form max width
```

### Header Dimensions
```tsx
height: 80px              // Header height
height: 40px              // Announcement bar height
```

## 🔄 Responsive Design

### Breakpoints
Follow Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Common Responsive Patterns
```tsx
// Padding
px-[16px] md:px-[40px]

// Typography
text-[56px] md:text-[128px]

// Spacing
pt-[32px] md:pt-[120px]
```

## 🎯 Usage Guidelines

### DO ✅
- Use exact pixel values from Figma (`text-[128px]`, not `text-8xl`)
- Use hex colors directly (`#161616`, not `black`)
- Include font variation settings for DM Sans: `style={{ fontVariationSettings: "'opsz' 14" }}`
- Use `font-['Font_Name']` syntax for font families
- Add `uppercase` class for subheadings and button titles

### DON'T ❌
- Don't create custom color names (use hex values)
- Don't approximate sizes (use exact Figma values)
- Don't use Tailwind's default colors/sizes
- Don't forget letter-spacing on text
- Don't use generic font-weight classes without checking Figma

## 🔄 Syncing with Figma

To update design tokens from Figma:

```bash
# Use Figma MCP tools to extract variables
mcp_figma2_get_variable_defs --fileKey=ttxSg4wMtXPqfcQEh6B405
```

Then update `lib/design-system.ts` with the new values.

## 📝 Examples

### Contact Page Header
```tsx
<div className="w-full border-b border-[#BBBBBB] pt-[32px] pb-[32px] bg-[#E1E1E1]">
  <div className="px-[16px] md:px-[40px]">
    <h1
      className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
      style={{ fontVariationSettings: "'opsz' 14" }}
    >
      Contact us
    </h1>
  </div>
</div>
```

### Form Field
```tsx
<div className="flex flex-col gap-[4px]">
  <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
    EMAIL ADDRESS <span className="text-[#F63333]">*</span>
  </label>
  <input
    type="email"
    className="h-[48px] border border-[#BBBBBB] bg-white font-['Outfit'] font-normal text-[12px] text-[#161616] tracking-[0.6px] uppercase outline-none px-[16px] focus:border-[#161616] transition-colors"
  />
</div>
```

---

**Last Updated**: November 30, 2025  
**Figma File**: [View in Figma](https://www.figma.com/design/ttxSg4wMtXPqfcQEh6B405/)
