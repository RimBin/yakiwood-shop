module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Fonts from Figma design system
      fontFamily: {
        'DM_Sans': ['var(--font-dm-sans)', 'sans-serif'],
        'Outfit': ['var(--font-outfit)', 'sans-serif'],
        'Tiro_Tamil': ['var(--font-tiro-tamil)', 'serif'],
      },
      // Colors from Figma design system (node 313:92)
      colors: {
        // Background colors
        wood: '#E4E4E4',
        'lighter-grey': '#EAEAEA',
        grey: '#E1E1E1',
        // Text colors
        'light-grey': '#BBBBBB',
        'dark-grey': '#535353',
        black: '#161616',
        white: '#FFFFFF',
        // System colors
        'system-red': '#FB3333',
        // Legacy aliases (for backwards compatibility)
        text: {
          black: '#161616',
          grey: '#7C7C7C',
          'dark-grey': '#535353',
          white: '#FFFFFF',
        },
        bg: {
          black: '#161616',
          grey: '#E1E1E1',
          white: '#FFFFFF',
        },
        error: '#F63333',
      },
      // Typography from Figma design system (updated from 60-page extraction)
      fontSize: {
        // Headings (Desktop 1440px)
        'h1': ['128px', { lineHeight: '121.6px', letterSpacing: '-6.4px', fontWeight: '300' }], // DM Sans Light
        'h2': ['48px', { lineHeight: '52.8px', letterSpacing: '-0.96px', fontWeight: '400' }], // DM Sans Regular
        'h3': ['32px', { lineHeight: '35.2px', letterSpacing: '-1.28px', fontWeight: '400' }], // DM Sans Regular
        'h4': ['24px', { lineHeight: '26.4px', letterSpacing: '-0.96px', fontWeight: '400' }], // DM Sans Regular
        'h5': ['18px', { lineHeight: '21.6px', letterSpacing: '-0.36px', fontWeight: '500' }], // DM Sans Medium
        // Body & UI Text
        'body': ['12px', { lineHeight: '15.6px', letterSpacing: '0px', fontWeight: '400' }], // Outfit Regular
        'button': ['12px', { lineHeight: '14.4px', letterSpacing: '0.6px', fontWeight: '400' }], // Outfit Regular uppercase
        'subheading': ['12px', { lineHeight: '15.6px', letterSpacing: '0.6px', fontWeight: '400' }], // Outfit Regular uppercase
        'light-text': ['14px', { lineHeight: '18.2px', letterSpacing: '0.14px', fontWeight: '300' }], // Outfit Light
        // Accent & Special
        'quote': ['24px', { lineHeight: '34px', letterSpacing: '0px', fontStyle: 'italic' }], // Tiro Tamil
        'price': ['16px', { lineHeight: '19.2px', letterSpacing: '-0.32px', fontWeight: '400' }], // DM Sans Regular
        'copyright': ['16px', { lineHeight: '17.6px', letterSpacing: '-0.64px', fontWeight: '500' }], // DM Sans Medium
        // Legacy/Deprecated (for backwards compatibility)
        'menu': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'cta': ['16px', { fontWeight: '400' }],
        'numbers': ['96px', { lineHeight: '115px', fontWeight: '300' }],
      },
      // Spacing system from Figma design system (gaps, padding, margins)
      spacing: {
        // Component gaps
        'gap-xs': '4px',
        'gap-sm': '8px',
        'gap-md': '16px',
        'gap-lg': '24px',
        'gap-xl': '32px',
        'gap-2xl': '40px',
        'gap-3xl': '64px',
        'gap-200': '200px', // Announcement bar spacing
        // Padding
        'p-xs': '8px',
        'p-sm': '10px',
        'p-md': '16px',
        'p-lg': '24px',
        'p-xl': '32px',
        'p-2xl': '40px',
        // Container widths
        'container-mobile': '16px',
        'container-desktop': '40px',
      },
      // Border radius from Figma design system
      borderRadius: {
        'button': '100px',   // Pill-shaped buttons
        'card': '24px',      // Product/project cards
        'input': '8px',      // Input fields, logo badges
        'chip': '100px',     // Filter chips
        'circle': '50%',     // Color swatches
      },
      // Component-specific dimensions from Figma
      width: {
        'cart-image': '168px',
        'cart-content': '708px',
        'order-summary': '420px',
        'product-card': '328px',
        'coupon-input': '420px',
        'coupon-button': '118px',
      },
      height: {
        'header': '80px',
        'footer': '606px',
        'announcement-bar': '40px',
        'input': '48px',
        'button': '48px',
        'product-image': '250px',
        'cart-image': '180px',
        'coupon-input': '56px',
      },
      // Max widths from Figma design system
      maxWidth: {
        'layout': '1440px',
        'form': '600px',
        'content': '838px',
      },
    },
  },
  plugins: [],
};
