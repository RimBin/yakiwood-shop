import type { FaqEntry } from './faq';

function normalizeLt(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ąčęėįšųūž\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  const normalized = normalizeLt(input);
  if (!normalized) return [];
  return normalized.split(' ').filter((w) => w.length >= 2);
}

function scoreEntry(messageTokens: string[], entry: FaqEntry): number {
  const questionTokens = tokenize(entry.question);
  const keywordTokens = entry.keywords.flatMap(tokenize);

  const pool = new Set([...questionTokens, ...keywordTokens]);
  if (pool.size === 0) return 0;

  let hits = 0;
  for (const t of messageTokens) {
    if (pool.has(t)) hits++;
  }

  const keywordSet = new Set(keywordTokens);
  const keywordHit = messageTokens.some((t) => keywordSet.has(t)) ? 1 : 0;

  return hits + keywordHit * 0.5;
}

export type MatchResult = {
  entry: FaqEntry;
  confidence: number; // 0..1
};

export function matchFaq(message: string, entries: FaqEntry[]): MatchResult {
  const tokens = tokenize(message);

  const fallback = entries.find((e) => e.id === 'fallback') ?? entries[entries.length - 1]!;

  if (tokens.length === 0) {
    return { entry: fallback, confidence: 0 };
  }

  let best = fallback;
  let bestScore = -1;

  for (const entry of entries) {
    if (entry.id === 'fallback') continue;
    const score = scoreEntry(tokens, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  const confidence = Math.max(0, Math.min(1, bestScore / 4));

  if (bestScore < 1) {
    return { entry: fallback, confidence: 0.15 };
  }

  return { entry: best, confidence };
}
