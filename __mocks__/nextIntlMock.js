/**
 * Minimal mock for next-intl used in Jest/unit tests.
 * This avoids Jest ESM parsing issues from next-intl's ESM-only runtime.
 */

function useTranslations() {
  return (key) => key;
}

function useLocale() {
  return 'lt';
}

function NextIntlClientProvider({ children }) {
  return children;
}

module.exports = {
  useTranslations,
  useLocale,
  NextIntlClientProvider,
};
