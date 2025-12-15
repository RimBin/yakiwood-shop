/**
 * Design System Tokens
 * Extracted from Figma Design System (File: ttxSg4wMtXPqfcQEh6B405)
 * Updated from 60-page comprehensive extraction (Dec 2024)
 * See ASSET_VARIABLES.md for full documentation
 */

export const colors = {
  // Background Colors
  background: {
    black: '#161616',
    white: '#FFFFFF',
    grey: '#E1E1E1',
    lighterGrey: '#EAEAEA',
    wood: '#E4E4E4',
  },
  // Text Colors
  text: {
    black: '#161616',
    white: '#FFFFFF',
    darkGrey: '#535353',
    grey: '#7C7C7C',
    lightGrey: '#BBBBBB',
  },
  // UI/System Colors
  ui: {
    border: '#BBBBBB',
    systemRed: '#FB3333',
    hoverOverlay: 'rgba(22, 22, 22, 0.05)',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    footerLogoBg: 'rgba(254, 254, 254, 0.1)',
  },
} as const;

// Typography scale from Figma (with font-variation-settings for DM Sans)
export const typography = {
  // Headings (Desktop 1440px) - DM Sans
  heading1: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '128px',
    lineHeight: '121.6px',
    letterSpacing: '-6.4px',
    fontWeight: 300, // Light
    fontVariationSettings: "'opsz' 14",
  },
  heading2: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '48px',
    lineHeight: '52.8px',
    letterSpacing: '-0.96px',
    fontWeight: 400, // Regular
    fontVariationSettings: "'opsz' 14",
  },
  heading3: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '32px',
    lineHeight: '35.2px',
    letterSpacing: '-1.28px',
    fontWeight: 400, // Regular
    fontVariationSettings: "'opsz' 14",
  },
  heading4: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '24px',
    lineHeight: '26.4px',
    letterSpacing: '-0.96px',
    fontWeight: 400, // Regular
    fontVariationSettings: "'opsz' 14",
  },
  heading5: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '18px',
    lineHeight: '21.6px',
    letterSpacing: '-0.36px',
    fontWeight: 500, // Medium
    fontVariationSettings: "'opsz' 14",
  },
  // Body & UI Text - Outfit
  body: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '12px',
    lineHeight: '15.6px',
    letterSpacing: '0px',
    fontWeight: 400, // Regular
  },
  button: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '12px',
    lineHeight: '14.4px',
    letterSpacing: '0.6px',
    fontWeight: 400, // Regular
    textTransform: 'uppercase' as const,
  },
  subheading: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '12px',
    lineHeight: '15.6px',
    letterSpacing: '0.6px',
    fontWeight: 400, // Regular
    textTransform: 'uppercase' as const,
  },
  lightText: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '14px',
    lineHeight: '18.2px',
    letterSpacing: '0.14px',
    fontWeight: 300, // Light
  },
  // Accent & Special - DM Sans
  price: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '16px',
    lineHeight: '19.2px',
    letterSpacing: '-0.32px',
    fontWeight: 400, // Regular
    fontVariationSettings: "'opsz' 14",
  },
  copyright: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '16px',
    lineHeight: '17.6px',
    letterSpacing: '-0.64px',
    fontWeight: 500, // Medium
    fontVariationSettings: "'opsz' 14",
  },
  // Quote style - Tiro Tamil
  quote: {
    fontFamily: 'var(--font-tiro-tamil)',
    fontSize: '24px',
    lineHeight: '34px',
    letterSpacing: '0px',
    fontStyle: 'italic' as const,
    fontWeight: 400, // Regular
  },
  // Legacy (kept for backwards compatibility)
  menu: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  cta: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '16px',
    fontWeight: 400,
  },
  numbers: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '96px',
    lineHeight: '115px',
    fontWeight: 300,
  },
} as const;

// Spacing scale from Figma design system
export const spacing = {
  // Component gaps (from Figma code analysis)
  gapXs: '4px',
  gapSm: '8px',
  gapMd: '16px',
  gapLg: '24px',
  gapXl: '32px',
  gap2xl: '40px',
  gap3xl: '64px',
  gap200: '200px', // Announcement bar horizontal spacing
  // Padding
  pXs: '8px',
  pSm: '10px',
  pMd: '16px',
  pLg: '24px',
  pXl: '32px',
  p2xl: '40px',
  // Legacy spacing (kept for backwards compatibility)
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

// Border radius from Figma
export const borderRadius = {
  button: '100px',   // Pill-shaped buttons
  card: '24px',      // Product/project cards
  input: '8px',      // Input fields, logo badges
  chip: '100px',     // Filter chips
  circle: '50%',     // Color swatches
  // Legacy (backwards compatibility)
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  full: '100px',
} as const;

// Breakpoints (from Figma designs analysis)
export const breakpoints = {
  mobile: '390px',   // Mobile designs found
  tablet: '768px',   // Interpolated
  desktop: '1440px', // Desktop designs found
} as const;

// Component-specific tokens from Figma extraction
export const components = {
  // Buttons
  button: {
    primary: {
      background: colors.background.black,
      color: colors.text.white,
      paddingX: '40px',
      paddingY: '10px',
      borderRadius: borderRadius.button,
      height: '48px',
    },
    secondary: {
      background: colors.background.white,
      color: colors.text.black,
      paddingX: '40px',
      paddingY: '10px',
      borderRadius: borderRadius.button,
      height: '48px',
    },
  },
  // Input fields
  input: {
    height: '48px',
    padding: '16px',
    border: `1px solid ${colors.ui.border}`,
    borderRadius: borderRadius.input,
    iconSize: '24px',
  },
  // Filter chips
  filterChip: {
    active: {
      background: colors.background.black,
      color: colors.text.white,
      padding: '12px',
      borderRadius: borderRadius.chip,
      height: '32px',
    },
    inactive: {
      background: 'transparent',
      color: colors.text.black,
      border: `1px solid ${colors.ui.border}`,
      padding: '12px',
      borderRadius: borderRadius.chip,
      height: '32px',
    },
  },
  // Product cards
  productCard: {
    width: '328px',
    imageHeight: '250px',
    imageBorder: '0.3px solid #161616',
    gap: spacing.gapSm,
  },
  // Cart components
  cartCard: {
    imageWidth: '168px',
    imageHeight: '180px',
    contentWidth: '708px',
    gap: spacing.gapLg,
  },
  orderSummary: {
    width: '420px',
    padding: spacing.pXl,
    gap: spacing.gap2xl,
    background: colors.background.black,
    dividerWidth: '356px',
  },
  couponInput: {
    width: '420px',
    height: '56px',
    borderRadius: borderRadius.button,
    buttonWidth: '118px',
    buttonHeight: '48px',
  },
  // Announcement bar
  announcementBar: {
    height: '40px',
    gap: spacing.gap200,
    iconSize: '24px',
    background: colors.background.black,
    padding: `${spacing.pXs} ${spacing.p2xl}`,
  },
  // Header
  header: {
    height: '80px',
    padding: `16px ${spacing.p2xl}`,
    logoWidth: '126px',
    logoHeight: '48px',
    navGap: spacing.p2xl,
    cartButtonHeight: '48px',
    cartBadgeSize: '16px',
  },
  // Footer
  footer: {
    height: '606px',
    background: colors.background.black,
    logoBadgeSize: '104px',
    logoBorderRadius: borderRadius.input,
    paymentLogoGap: '24.39px',
  },
  // Legacy card (backwards compatibility)
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
  },
} as const;

// Export type helpers
export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
