/**
 * Design System Tokens
 * Extracted from Figma: ttxSg4wMtXPqfcQEh6B405
 * DO NOT modify these values - they are synchronized with Figma
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  text: {
    black: '#161616',
    grey: '#7C7C7C',
    darkGrey: '#535353',
    white: '#FFFFFF',
  },
  background: {
    black: '#161616',
    grey: '#E1E1E1',
    white: '#FFFFFF',
  },
  ui: {
    lightGrey: '#BBBBBB',
    error: '#F63333',
  },
} as const;

// ============================================================================
// TYPOGRAPHY - 1440px (Desktop)
// ============================================================================

export const typography = {
  h1: {
    fontFamily: 'DM Sans',
    fontWeight: 300, // Light
    fontSize: '128px',
    lineHeight: 0.95,
    letterSpacing: '-6.4px', // -5% of font size
  },
  h4: {
    fontFamily: 'DM Sans',
    fontWeight: 400, // Regular
    fontSize: '24px',
    lineHeight: 1.1,
    letterSpacing: '-0.96px', // -4% of font size
  },
  bigText: {
    fontFamily: 'DM Sans',
    fontWeight: 300, // Light
    fontSize: '52px',
    lineHeight: 1,
    letterSpacing: '-2.08px', // -4% of font size
  },
  copyright: {
    fontFamily: 'DM Sans',
    fontWeight: 500, // Medium
    fontSize: '16px',
    lineHeight: 1.1,
    letterSpacing: '-0.64px', // -4% of font size
  },
  text: {
    fontFamily: 'Outfit',
    fontWeight: 300, // Light
    fontSize: '14px',
    lineHeight: 1.2,
    letterSpacing: '0.14px', // 1% of font size
  },
  textAlt: {
    fontFamily: 'Outfit',
    fontWeight: 300, // Light
    fontSize: '14px',
    lineHeight: 1.3,
    letterSpacing: '0.14px', // 1% of font size
  },
  subheading: {
    fontFamily: 'Outfit',
    fontWeight: 400, // Regular
    fontSize: '12px',
    lineHeight: 1.3,
    letterSpacing: '0.6px', // 5% of font size
    textTransform: 'uppercase' as const,
  },
  btnTitle: {
    fontFamily: 'Outfit',
    fontWeight: 400, // Regular
    fontSize: '12px',
    lineHeight: 1.2,
    letterSpacing: '0.6px', // 5% of font size
    textTransform: 'uppercase' as const,
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  container: {
    mobile: '16px',
    desktop: '40px',
  },
  sections: {
    small: '32px',
    medium: '56px',
    large: '80px',
    xlarge: '120px',
  },
  components: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const borders = {
  default: `1px solid ${colors.ui.lightGrey}`,
  focus: `1px solid ${colors.text.black}`,
  radius: {
    button: '100px',
    card: '24px',
    input: '0px',
  },
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

export const components = {
  input: {
    height: '48px',
    padding: '16px',
    borderColor: colors.ui.lightGrey,
    backgroundColor: colors.background.white,
    focusBorderColor: colors.text.black,
  },
  button: {
    height: '48px',
    paddingX: '40px',
    paddingY: '10px',
    borderRadius: borders.radius.button,
    backgroundColor: colors.background.black,
    color: colors.text.white,
  },
  checkbox: {
    size: '24px',
    borderColor: colors.text.black,
    checkedBackgroundColor: colors.background.black,
  },
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
  maxWidth: '1440px',
  formMaxWidth: '600px',
  contentMaxWidth: '838px',
  header: {
    height: '80px',
    announcementBarHeight: '40px',
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert design system typography to Tailwind classes
 */
export const getTypographyClasses = (variant: keyof typeof typography) => {
  const t = typography[variant];
  const fontFamily = t.fontFamily === 'DM Sans' ? 'DM_Sans' : t.fontFamily;
  const fontWeight = t.fontWeight === 300 ? 'font-light' : 
                     t.fontWeight === 400 ? 'font-normal' :
                     t.fontWeight === 500 ? 'font-medium' : 'font-normal';
  
  return `font-['${fontFamily}'] ${fontWeight}`;
};

/**
 * Convert hex color to RGB for Tailwind
 */
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};
