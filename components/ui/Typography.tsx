/**
 * Typography Component
 * Based on Figma Design System (Node 313:38)
 * Provides consistent text styling across the application
 */

import React from 'react';

// Typography style classes mapped to Figma design system
export const typographyStyles = {
  h1: "font-['DM_Sans'] font-light text-[64px] leading-[77px] tracking-[-1.6px]",
  h2: "font-['DM_Sans'] font-light text-[48px] leading-[58px] tracking-[-0.96px]",
  h3: "font-['DM_Sans'] font-light text-[40px] leading-[48px]",
  h4: "font-['DM_Sans'] font-light text-[32px] leading-[38px]",
  h5: "font-['DM_Sans'] font-light text-[24px] leading-[29px]",
  quote: "font-['Tiro_Tamil'] italic text-[24px] leading-[34px]",
  menu: "font-['DM_Sans'] text-[16px] leading-[24px]",
  button: "font-['Outfit'] font-medium text-[16px]",
  cta: "font-['Outfit'] text-[16px]",
  price: "font-['Outfit'] font-medium text-[18px]",
  subheading: "font-['Outfit'] font-light text-[14px] leading-[17px]",
  numbers: "font-['DM_Sans'] font-light text-[96px] leading-[115px]",
  copyright: "font-['DM_Sans'] text-[12px] leading-[14px]",
} as const;

type TypographyVariant = keyof typeof typographyStyles;

interface TypographyProps {
  variant: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Typography component with predefined styles from Figma
 * @example
 * <Typography variant="h1">Main Heading</Typography>
 * <Typography variant="quote">Beautiful quote text</Typography>
 * <Typography variant="button">Button Text</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className = '',
  as,
}) => {
  // Default HTML element based on variant
  const defaultElement: { [key in TypographyVariant]: keyof JSX.IntrinsicElements } = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    quote: 'blockquote',
    menu: 'span',
    button: 'span',
    cta: 'span',
    price: 'span',
    subheading: 'p',
    numbers: 'span',
    copyright: 'span',
  };

  const Element = as || defaultElement[variant];
  const baseStyles = typographyStyles[variant];

  return <Element className={`${baseStyles} ${className}`}>{children}</Element>;
};

// Convenience components for common use cases
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const Quote: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="quote" {...props} />
);

export const Price: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="price" {...props} />
);
