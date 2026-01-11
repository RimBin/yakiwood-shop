import crypto from 'node:crypto'

export type PayseraRequestParams = Record<string, string | number | boolean | null | undefined>

function toStringValue(value: PayseraRequestParams[string]): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? '1' : '0'
  return String(value)
}

/**
 * Paysera encodes all request parameters into a single `data` string:
 * 1) URL-encode query string
 * 2) base64 encode
 * 3) replace "+" -> "-" and "/" -> "_" (URL-safe base64)
 */
export function encodePayseraData(params: PayseraRequestParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    search.set(key, toStringValue(value))
  }

  const raw = search.toString()
  const base64 = Buffer.from(raw, 'utf8').toString('base64')

  return base64.replace(/\+/g, '-').replace(/\//g, '_')
}

export function decodePayseraData(data: string): Record<string, string> {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  const decoded = Buffer.from(normalized, 'base64').toString('utf8')

  const search = new URLSearchParams(decoded)
  const out: Record<string, string> = {}
  for (const [key, value] of search.entries()) {
    out[key] = value
  }
  return out
}

export function signPayseraDataMd5(data: string, password: string): string {
  return crypto.createHash('md5').update(`${data}${password}`, 'utf8').digest('hex')
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a.toLowerCase(), 'utf8')
  const bBuf = Buffer.from(b.toLowerCase(), 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}
