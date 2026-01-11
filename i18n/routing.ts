import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'lt'],
  defaultLocale: 'en',
  // EN is canonical without a prefix; LT uses /lt
  localePrefix: 'as-needed'
});
