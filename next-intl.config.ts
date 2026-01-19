const config = {
  locales: ['en', 'lt'],
  defaultLocale: 'en',
  // EN is canonical without a prefix; LT uses /lt
  localePrefix: 'as-needed'
} as const;

export default config;
