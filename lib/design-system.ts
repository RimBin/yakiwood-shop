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
  h2: {
    fontFamily: 'DM Sans',
    fontWeight: 400, // Regular
    fontSize: '64px',
    lineHeight: 1.1,
    letterSpacing: '-2.56px', // -4% of font size
  },
  h3: {
    fontFamily: 'DM Sans',
    fontWeight: 300, // Light
    fontSize: '40px',
    lineHeight: 1.2,
    letterSpacing: '-1.6px', // -4% of font size
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
// SPACING SYSTEM
// ============================================================================

/**
 * Spacing scale based on 8px grid
 * Change these values to update spacing across entire site
 */
export const spacing = {
  // Base units (8px grid)
  0: '0px',
  1: '4px',    // 0.5 × 8
  2: '8px',    // 1 × 8
  3: '12px',   // 1.5 × 8
  4: '16px',   // 2 × 8
  5: '20px',   // 2.5 × 8
  6: '24px',   // 3 × 8
  7: '28px',   // 3.5 × 8
  8: '32px',   // 4 × 8
  10: '40px',  // 5 × 8
  12: '48px',  // 6 × 8
  14: '56px',  // 7 × 8
  16: '64px',  // 8 × 8
  20: '80px',  // 10 × 8
  24: '96px',  // 12 × 8
  28: '112px', // 14 × 8
  32: '128px', // 16 × 8
  
  // Container padding (responsive)
  container: {
    mobile: '16px',   // spacing[4]
    tablet: '32px',   // spacing[8]
    desktop: '40px',  // spacing[10]
  },
  
  // Section spacing (vertical gaps between major sections)
  section: {
    mobile: '64px',   // spacing[16]
    tablet: '80px',   // spacing[20]
    desktop: '120px', // 24 × 8
  },
  
  // Component spacing (gaps within components)
  component: {
    xs: '4px',   // spacing[1]
    sm: '8px',   // spacing[2]
    md: '16px',  // spacing[4]
    lg: '24px',  // spacing[6]
    xl: '40px',  // spacing[10]
  },
} as const;

/**
 * Responsive padding utility
 * Usage: className={cn(getSectionPadding())}
 */
export const getSectionPadding = (axis: 'x' | 'y' | 'all' = 'all') => {
  if (axis === 'x') return 'px-[16px] md:px-[32px] lg:px-[40px]';
  if (axis === 'y') return 'py-[64px] md:py-[80px] lg:py-[120px]';
  return 'px-[16px] md:px-[32px] lg:px-[40px] py-[64px] md:py-[80px] lg:py-[120px]';
};

/**
 * Responsive container padding
 * Usage: className={getContainerPadding()}
 */
export const getContainerPadding = () => 'px-[16px] md:px-[32px] lg:px-[40px]';

/**
 * Responsive section vertical spacing
 * Usage: className={getSectionSpacing()}
 */
export const getSectionSpacing = () => 'py-[64px] md:py-[80px] lg:py-[120px]';

/**
 * Gap utilities for flex/grid
 */
export const getGap = (size: keyof typeof spacing.component) => {
  const gaps = {
    xs: 'gap-[4px]',
    sm: 'gap-[8px]',
    md: 'gap-[16px]',
    lg: 'gap-[24px]',
    xl: 'gap-[40px]',
  };
  return gaps[size];
};

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
 * Generate responsive clamp() value for fluid typography
 * @param mobile - Min size (mobile)
 * @param desktop - Max size (desktop)
 * @param minViewport - Min viewport width (default: 375px)
 * @param maxViewport - Max viewport width (default: 1440px)
 */
export const clamp = (
  mobile: number,
  desktop: number,
  minViewport = 375,
  maxViewport = 1440
): string => {
  const slope = (desktop - mobile) / (maxViewport - minViewport);
  const base = mobile - slope * minViewport;
  return `clamp(${mobile}px, ${base.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${desktop}px)`;
};

/**
 * Responsive typography with clamp()
 * Mobile → Desktop scaling
 */
export const responsiveTypography = {
  h1: clamp(48, 128),        // 48px mobile → 128px desktop
  h2: clamp(32, 64),         // 32px mobile → 64px desktop
  h3: clamp(24, 40),         // 24px mobile → 40px desktop
  h4: clamp(18, 24),         // 18px mobile → 24px desktop
  bigText: clamp(28, 52),    // 28px mobile → 52px desktop
  text: clamp(14, 16),       // 14px mobile → 16px desktop
} as const;

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
 * Get responsive font size as inline style
 * Usage: <h1 style={getResponsiveFontSize('h1')}>
 */
export const getResponsiveFontSize = (variant: keyof typeof responsiveTypography) => ({
  fontSize: responsiveTypography[variant],
});

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
