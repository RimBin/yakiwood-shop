module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'DM_Sans': ['var(--font-dm-sans)', 'sans-serif'],
        'Outfit': ['var(--font-outfit)', 'sans-serif'],
        'Tiro_Tamil': ['var(--font-tiro-tamil)', 'serif'],
      },
    },
  },
  plugins: [],
};
