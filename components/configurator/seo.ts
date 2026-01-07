import type { Metadata } from 'next';

export function getCanonicalProductPath(productSlug: string) {
  return `/products/${productSlug}`;
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
