/**
 * Centralized Spacing System
 * 
 * Pakeitus šias reikšmes, jos automatiškai pritaikomos visoje svetainėje
 * 
 * Usage:
 * import { spacing, sectionClasses } from '@/lib/design-system/spacing';
 * <div className={sectionClasses}>Content</div>
 */

// ============================================================================
// SPACING TOKENS - Keiskite čia, kad pakeistumėte visoje svetainėje
// ============================================================================

export const spacing = {
  // Container horizontal padding
  containerX: {
    mobile: '16px',   // Mobiliam ekranui
    tablet: '32px',   // Tablet (md:)
    desktop: '40px',  // Desktop (lg:)
  },
  
  // Section vertical padding
  sectionY: {
    mobile: '64px',   // Mobiliam ekranui
    tablet: '80px',   // Tablet (md:)
    desktop: '120px', // Desktop (lg:)
  },
  
  // Gap between elements
  gap: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
  },
} as const;

// ============================================================================
// UTILITY CLASSES - Naudokite šias klases komponentuose
// ============================================================================

/**
 * Section container padding (horizontal)
 * Mobile: 16px, Tablet: 32px, Desktop: 40px
 */
export const containerXClasses = 'px-[16px] md:px-[32px] lg:px-[40px]';

/**
 * Section vertical padding
 * Mobile: 64px, Tablet: 80px, Desktop: 120px
 */
export const sectionYClasses = 'py-[64px] md:py-[80px] lg:py-[120px]';

/**
 * Full section padding (horizontal + vertical)
 */
export const sectionClasses = `${containerXClasses} ${sectionYClasses}`;

/**
 * Container-only padding (no vertical)
 */
export const containerClasses = containerXClasses;

// ============================================================================
// RESPONSIVE HELPER FUNCTIONS
// ============================================================================

/**
 * Get responsive padding classes
 */
export const getPadding = (type: 'section' | 'container' | 'x' | 'y' = 'section') => {
  switch (type) {
    case 'section': return sectionClasses;
    case 'container': return containerClasses;
    case 'x': return containerXClasses;
    case 'y': return sectionYClasses;
    default: return sectionClasses;
  }
};

/**
 * Get gap class
 */
export const getGap = (size: keyof typeof spacing.gap) => {
  return `gap-[${spacing.gap[size]}]`;
};

// ============================================================================
// SPACING SCALE (8px grid system)
// ============================================================================

export const scale = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;
