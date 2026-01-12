import { toLocalePath, type AppLocale } from '@/i18n/paths'

const CANONICAL_ORIGIN = 'https://yakiwood.lt'

export function canonicalUrl(path: string, locale: AppLocale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${CANONICAL_ORIGIN}${toLocalePath(normalized, locale)}`
}
