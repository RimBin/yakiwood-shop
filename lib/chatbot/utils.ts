export function normalizeText(input: string): string {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ąčęėįšųūž\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeText(input: string, minLength = 2): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  return normalized.split(' ').filter((token) => token.length >= minLength);
}
