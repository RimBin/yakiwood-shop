import crypto from 'crypto'

function getSecret(): string | null {
  const secret = process.env.PRICING_QUOTE_TOKEN_SECRET
  return typeof secret === 'string' && secret.trim().length > 0 ? secret.trim() : null
}

export function hashQuoteToken(token: string): string {
  const secret = getSecret()
  if (!secret) {
    throw new Error('PRICING_QUOTE_TOKEN_SECRET is required')
  }
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export function generateQuoteToken(): string {
  const raw = crypto.randomBytes(32)
  return raw.toString('base64url')
}

export function getQuoteTtlMinutes(): number {
  const raw = process.env.PRICING_QUOTE_TTL_MINUTES
  const parsed = raw ? Number(raw) : NaN
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 180) return Math.round(parsed)
  return 30
}
