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
      // Typography from Figma (node 313:38)
      fontSize: {
        'h1': ['64px', { lineHeight: '77px', letterSpacing: '-1.6px', fontWeight: '300' }],
        'h2': ['48px', { lineHeight: '58px', letterSpacing: '-0.96px', fontWeight: '300' }],
        'h3': ['40px', { lineHeight: '48px', fontWeight: '300' }],
        'h4': ['32px', { lineHeight: '38px', fontWeight: '300' }],
        'h5': ['24px', { lineHeight: '29px', fontWeight: '300' }],
        'quote': ['24px', { lineHeight: '34px', fontStyle: 'italic' }],
        'menu': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'button': ['16px', { fontWeight: '500' }],
        'cta': ['16px', { fontWeight: '400' }],
        'price': ['18px', { fontWeight: '500' }],
        'subheading': ['14px', { lineHeight: '17px', fontWeight: '300' }],
        'numbers': ['96px', { lineHeight: '115px', fontWeight: '300' }],
        'copyright': ['12px', { lineHeight: '14px', fontWeight: '400' }],
      },
      // Spacing from Figma design system
      spacing: {
        'container-mobile': '16px',
        'container-desktop': '40px',
      },
      // Border radius from Figma design system
      borderRadius: {
        'button': '100px',
        'card': '24px',
        'input': '8px',
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
