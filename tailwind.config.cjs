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
      // Colors from Figma design system
      colors: {
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
        'light-grey': '#BBBBBB',
        error: '#F63333',
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
