export type UsageSku = 'facade' | 'terrace' | 'interior' | 'fence'
export type WoodSku = 'spruce' | 'larch'

function slugifyToken(input: string): string {
  return String(input || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toSkuChunk(input: string): string {
  const v = slugifyToken(input)
  return v ? v.toUpperCase() : 'UNKNOWN'
}

export function usageToSkuCode(usage: string | null | undefined): string {
  const v = slugifyToken(String(usage || ''))
  if (v === 'facade') return 'FAC'
  if (v === 'terrace') return 'TER'
  if (v === 'interior') return 'INT'
  if (v === 'fence') return 'FEN'
  return toSkuChunk(v)
}

export function woodToSkuCode(wood: string | null | undefined): string {
  const v = slugifyToken(String(wood || ''))
  if (v === 'spruce') return 'SP'
  if (v === 'larch') return 'LA'
  return toSkuChunk(v)
}

export function profileToSkuCode(profileCodeOrLabel: string | null | undefined): string {
  const v = slugifyToken(String(profileCodeOrLabel || ''))
  if (!v) return 'NOPROFILE'

  if (v.includes('rect') || v.includes('staciakamp')) return 'RECT'
  if (v.includes('rhomb') || v.includes('romb')) return 'RHOM'
  if ((v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) && v.includes('45'))
    return 'HALF45'
  if (v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) return 'HALF'

  return toSkuChunk(v)
}

export function colorToSkuCode(colorCodeOrLabel: string | null | undefined): string {
  const v = slugifyToken(String(colorCodeOrLabel || ''))
  if (!v) return 'NOCOLOR'
  return toSkuChunk(v)
}

export function buildInventorySku(input: {
  usageType?: string | null
  woodType?: string | null
  profile?: string | null
  color?: string | null
  widthMm?: number | null
  lengthMm?: number | null
  thicknessMm?: number | null
}): string {
  const usage = usageToSkuCode(input.usageType)
  const wood = woodToSkuCode(input.woodType)
  const profile = profileToSkuCode(input.profile)
  const color = colorToSkuCode(input.color)

  const width = typeof input.widthMm === 'number' && Number.isFinite(input.widthMm) && input.widthMm > 0 ? Math.round(input.widthMm) : null
  const length = typeof input.lengthMm === 'number' && Number.isFinite(input.lengthMm) && input.lengthMm > 0 ? Math.round(input.lengthMm) : null
  const thickness =
    typeof input.thicknessMm === 'number' && Number.isFinite(input.thicknessMm) && input.thicknessMm > 0
      ? Math.round(input.thicknessMm)
      : null

  const size = width !== null && length !== null ? `${width}X${length}` : 'NOSIZE'
  const thick = thickness !== null ? `T${thickness}` : null

  return ['YW', usage, wood, profile, color, size, thick].filter(Boolean).join('-')
}

