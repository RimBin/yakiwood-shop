/**
 * Design System Tokens
 * Extracted from Figma Design System (File: ttxSg4wMtXPqfcQEh6B405)
 * Node 313:92 - Colors
 * Node 313:38 - Typography
 */

export const colors = {
  // Background Colors
  background: {
    wood: '#E4E4E4',
    lighterGrey: '#EAEAEA',
    grey: '#E1E1E1',
    black: '#161616',
  },
  // Text Colors
  text: {
    white: '#FFFFFF',
    lightGrey: '#BBBBBB',
    darkGrey: '#535353',
    black: '#161616',
  },
  // System Colors
  system: {
    red: '#FB3333',
  },
} as const;

// Typography scale from Figma
export const typography = {
  // Heading styles using DM Sans
  heading1: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '64px',
    lineHeight: '77px',
    letterSpacing: '-1.6px',
    fontWeight: 300,
  },
  heading2: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '48px',
    lineHeight: '58px',
    letterSpacing: '-0.96px',
    fontWeight: 300,
  },
  heading3: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '40px',
    lineHeight: '48px',
    fontWeight: 300,
  },
  heading4: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '32px',
    lineHeight: '38px',
    fontWeight: 300,
  },
  heading5: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '24px',
    lineHeight: '29px',
    fontWeight: 300,
  },
  // Quote style using Tiro Tamil
  quote: {
    fontFamily: 'var(--font-tiro-tamil)',
    fontSize: '24px',
    lineHeight: '34px',
    fontStyle: 'italic',
    fontWeight: 400,
  },
  // Menu/Navigation using DM Sans
  menu: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  // Button text using Outfit
  button: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '16px',
    fontWeight: 500,
  },
  // CTA button
  cta: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '16px',
    fontWeight: 400,
  },
  // Price text
  price: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '18px',
    fontWeight: 500,
  },
  // Subheading
  subheading: {
    fontFamily: 'var(--font-outfit)',
    fontSize: '14px',
    lineHeight: '17px',
    fontWeight: 300,
  },
  // Numbers (large)
  numbers: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '96px',
    lineHeight: '115px',
    fontWeight: 300,
  },
  // Copyright/small text
  copyright: {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: '12px',
    lineHeight: '14px',
    fontWeight: 400,
  },
} as const;

// Spacing scale (8px base)
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

// Border radius
export const borderRadius = {
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  full: '100px',
} as const;

// Breakpoints
export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
} as const;

// Component-specific tokens
export const components = {
  button: {
    paddingX: {
      sm: '24px',
      md: '32px',
      lg: '48px',
    },
    paddingY: {
      sm: '8px',
      md: '12px',
      lg: '16px',
    },
    borderRadius: borderRadius.full,
  },
  input: {
    paddingX: '16px',
    paddingY: '12px',
    borderRadius: borderRadius.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
} as const;

// Export type helpers
export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
