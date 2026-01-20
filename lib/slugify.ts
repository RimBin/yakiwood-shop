export type SlugifyOptions = {
  preserveDiacritics?: boolean
}

export function slugify(value: string, maxLength = 96, options?: SlugifyOptions): string {
  const preserveDiacritics = options?.preserveDiacritics ?? false

  const normalized = preserveDiacritics ? value.normalize('NFC') : value.normalize('NFKD')
  const sanitized = preserveDiacritics
    ? normalized.replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    : normalized.replace(/[^\w\s-]/g, '')

  return sanitized
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
}
