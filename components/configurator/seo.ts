import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/paths';
import { canonicalUrl } from '@/lib/seo/canonical';

export function getCanonicalProductPath(productSlug: string, locale: AppLocale = 'en') {
  return canonicalUrl(`/products/${productSlug}`, locale);
}

export function getPresetRobotsMeta(presetSlug: string | undefined | null): Metadata['robots'] | undefined {
  if (!presetSlug) return undefined;
  // Preset URLs represent a preselected configuration. We keep canonical to the base product URL
  // and mark these pages as NOINDEX to avoid duplicate indexing.
  return {
    index: false,
    follow: true,
  };
}
