import { seedProducts } from '@/data/seed-products'
import { createPublicClient } from '@/lib/supabase/public'
import type { TypedObject } from '@portabletext/types'

export interface ProductColorVariant {
  id: string
  name: string
  hex?: string
  image?: string
  description?: string
  priceModifier?: number
}

export interface ProductProfileVariant {
  id: string
  name: string
  code?: string
  description?: string
  priceModifier?: number
  dimensions?: {
    width?: number
    thickness?: number
    length?: number
  }
  image?: string
}

export interface Product {
  id: string
  slug: string
  slugEn?: string
  name: string
  nameEn?: string
  price: number
  salePrice?: number
  image: string
  category: string
  woodType?: string
  description?: string
  descriptionEn?: string
  descriptionPortable?: TypedObject | TypedObject[]
  images?: string[]
  colors?: ProductColorVariant[]
  profiles?: ProductProfileVariant[]
  specifications?: Array<{ label: string; value: string }>
  inStock?: boolean
}

type FetchProductsOptions = {
  mode?: 'active' | 'stock-items' | 'all'
}

type DbProduct = {
  id: string
  name: string
  name_en?: string | null
  slug: string
  slug_en?: string | null
  description: string | null
  description_en?: string | null
  base_price: string | number
  sale_price?: string | number | null
  wood_type: string | null
  category: string | null
  usage_type?: string | null
  image_url: string | null
  is_active: boolean | null
  product_variants?: DbVariant[]
}

type DbVariant = {
  id: string
  name: string
  label_lt?: string | null
  label_en?: string | null
  value_mm?: number | null
  variant_type: string
  hex_color: string | null
  price_adjustment: string | number | null
  texture_url: string | null
  image_url?: string | null
  stock_quantity: number | null
  is_available: boolean | null
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function transformSeedProduct(seed: (typeof seedProducts)[number]): Product {
  return {
    id: seed.id,
    slug: seed.slug,
    slugEn: (seed as any).slugEn ?? undefined,
    name: seed.name,
    price: seed.basePrice,
    image: seed.images?.[0] ?? '/images/ui/wood/imgSpruce.png',
    images: seed.images ?? [],
    category: seed.category,
    woodType: seed.woodType,
    description: seed.description,
    inStock: seed.inStock,
  }
}

export function transformDbProduct(db: DbProduct): Product {
  const variants = Array.isArray(db.product_variants) ? db.product_variants : []

  const slug = db.slug
  const isStockItem = !!slug && slug.includes('--') && (db.is_active === false || db.is_active === null)

  const colors: ProductColorVariant[] = variants
    .filter((v) => v.variant_type === 'color')
    .map((v) => ({
      id: v.id,
      name: v.label_en ?? v.name,
      hex: v.hex_color ?? undefined,
      image: v.image_url ?? v.texture_url ?? undefined,
      priceModifier: v.price_adjustment === null ? undefined : toNumber(v.price_adjustment),
    }))

  const hasExplicitProfiles = variants.some((v) => v.variant_type === 'profile')
  const profileSource = hasExplicitProfiles
    ? variants.filter((v) => v.variant_type === 'profile')
    : variants.filter((v) => v.variant_type === 'finish' || v.variant_type === 'profile')

  const profiles: ProductProfileVariant[] = profileSource
    .map((v) => ({
      id: v.id,
      name: v.label_lt ?? v.name,
      code: v.name,
      priceModifier: v.price_adjustment === null ? undefined : toNumber(v.price_adjustment),
      image: v.image_url ?? v.texture_url ?? undefined,
    }))

  const parsedStock = isStockItem ? parseStockItemSlug(slug) : null
  const stockColors: ProductColorVariant[] = parsedStock
    ? [
        {
          id: `stock-color:${parsedStock.color}`,
          name: humanizeSlugToken(parsedStock.color),
        },
      ]
    : []

  const stockProfiles: ProductProfileVariant[] = parsedStock
    ? [
        {
          id: `stock-profile:${parsedStock.profile}`,
          name: humanizeSlugToken(parsedStock.profile),
          code: parsedStock.profile,
        },
      ]
    : []

  const image = db.image_url || '/images/ui/wood/imgSpruce.png'
  const usage = db.usage_type || db.category || 'facade'

  const inStock =
    variants.length === 0
      ? true
      : variants.some((v) => (v.is_available ?? true) && (v.stock_quantity ?? 0) > 0)

  return {
    id: db.id,
    slug: db.slug,
    slugEn: db.slug_en ?? undefined,
    name: db.name,
    nameEn: db.name_en ?? undefined,
    price: toNumber(db.base_price),
    salePrice: db.sale_price === null ? undefined : toNumber(db.sale_price),
    image,
    images: db.image_url ? [db.image_url] : [],
    category: usage,
    woodType: db.wood_type ?? undefined,
    description: db.description ?? undefined,
    descriptionEn: db.description_en ?? undefined,
    colors: colors.length ? colors : stockColors.length ? stockColors : undefined,
    profiles: profiles.length ? profiles : stockProfiles.length ? stockProfiles : undefined,
    inStock,
  }
}

function humanizeSlugToken(token: string): string {
  const safe = token.trim().replace(/[_\s]+/g, '-')
  return safe
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const COLOR_LABELS: Record<string, { lt: string; en: string }> = {
  black: { lt: 'Black', en: 'Black' },
  silver: { lt: 'Silver', en: 'Silver' },
  graphite: { lt: 'Graphite', en: 'Graphite' },
  latte: { lt: 'Latte', en: 'Latte' },
  carbon: { lt: 'Carbon', en: 'Carbon' },
  'carbon-light': { lt: 'Carbon Light', en: 'Carbon Light' },
  'carbon-dark': { lt: 'Carbon Dark', en: 'Carbon Dark' },
  brown: { lt: 'Brown', en: 'Brown' },
  'dark-brown': { lt: 'Dark Brown', en: 'Dark Brown' },
}

function normalizeColorKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function localizeColorLabel(input: string, locale: 'lt' | 'en'): string {
  const normalized = normalizeColorKey(input)
  if (!normalized) return input

  const direct = COLOR_LABELS[normalized]
  if (direct) return direct[locale]

  const parts = normalized.split('-').filter(Boolean)
  if (parts.length > 1) {
    const mapped = parts.map((part) => COLOR_LABELS[part]?.[locale] ?? humanizeSlugToken(part))
    return mapped.join(' ')
  }

  return humanizeSlugToken(normalized)
}

function parseStockItemSlug(
  slug: string
):
  | {
      baseSlug: string
      profile: string
      color: string
      size: string
    }
  | null {
  // Stock-item slugs are generated like:
  //   <baseSlug>--<profile>--<color>--<width>x<length>
  const parts = slug.split('--')
  if (parts.length < 4) return null
  const [baseSlug, profile, color, size] = parts
  if (!baseSlug || !profile || !color || !size) return null
  return { baseSlug, profile, color, size }
}

function formatSupabaseError(error: unknown): string {
  if (!error) return '<no error details>'

  if (error instanceof Error) {
    return error.message || error.name
  }

  if (typeof error === 'string') return error

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>

    // Supabase/PostgREST errors frequently have non-enumerable properties.
    const message = typeof record.message === 'string' ? record.message : null
    const code = typeof record.code === 'string' ? record.code : null
    const details = typeof record.details === 'string' ? record.details : null
    const hint = typeof record.hint === 'string' ? record.hint : null
    const status =
      typeof record.status === 'number'
        ? String(record.status)
        : typeof record.status === 'string'
          ? record.status
          : null

    const parts = [
      message,
      code ? `code=${code}` : null,
      status ? `status=${status}` : null,
      details ? `details=${details}` : null,
      hint ? `hint=${hint}` : null,
    ].filter(Boolean)

    if (parts.length > 0) return parts.join(' | ')

    try {
      const keys = Object.getOwnPropertyNames(error)
      const picked: Record<string, unknown> = {}
      for (const key of keys) {
        picked[key] = (error as Record<string, unknown>)[key]
      }
      const json = JSON.stringify(picked)
      return json === '{}' ? '[object]' : json
    } catch {
      return '[object]'
    }
  }

  return String(error)
}

export async function fetchProducts(options?: FetchProductsOptions): Promise<Product[]> {
  const supabase = createPublicClient()

  if (!supabase) {
    return seedProducts.map(transformSeedProduct)
  }

  const mode = options?.mode ?? 'active'

  // In the browser, prefer the server API for stock-item listing so it can use
  // the service role key (and avoid requiring public RLS changes).
  if (typeof window !== 'undefined' && mode === 'stock-items') {
    try {
      const res = await fetch('/api/products?mode=stock-items', {
        headers: {
          accept: 'application/json',
        },
      })

      if (res.ok) {
        const json = (await res.json()) as unknown
        if (Array.isArray(json)) {
          return (json as unknown as DbProduct[]).map(transformDbProduct)
        }
      } else if (res.status === 503) {
        try {
          const payload = (await res.json()) as { error?: string }
          if (payload?.error) {
            throw new Error(payload.error)
          }
        } catch {
          throw new Error('Stock-item products are not available in the current environment.')
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
      // fall back to direct Supabase query
    }
  }

  let query = supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false })

  if (mode === 'active') {
    query = query.eq('is_active', true)
  } else if (mode === 'stock-items') {
    query = query.eq('is_active', false).ilike('slug', '%--%')
  }

  const { data, error } = await query

  if (error) {
    // Expected in local/demo environments when DB/RLS/schema isn't ready.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase products fetch failed:', formatSupabaseError(error))
    }
    return seedProducts.map(transformSeedProduct)
  }

  if (!data || data.length === 0) {
    return []
  }

  return (data as unknown as DbProduct[]).map(transformDbProduct)
}

export async function fetchProductBySlug(
  slug: string,
  options?: {
    locale?: 'en' | 'lt'
  }
): Promise<Product | null> {
  const supabase = createPublicClient()

  if (!supabase) {
    const seed = seedProducts.find((p) => p.slug === slug)
    return seed ? transformSeedProduct(seed) : null
  }

  const locale = options?.locale
  const columnsToTry = locale === 'en' ? (['slug_en', 'slug'] as const) : (['slug', 'slug_en'] as const)

  const allowInactive = slug.includes('--')

  for (const column of columnsToTry) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq(column, slug)
        .eq('is_active', true)
        .maybeSingle()

      if (allowInactive && !error && !data) {
        // For stock-item pages, we need to be able to resolve inactive rows.
        // NOTE: This still depends on RLS policies permitting select.
        const fallback = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .eq(column, slug)
          .maybeSingle()

        if (!fallback.error && fallback.data) {
          return transformDbProduct(fallback.data as unknown as DbProduct)
        }
      }

      if (error) {
        // Older schemas may not have slug_en yet.
        const message = formatSupabaseError(error)
        if (/slug_en/i.test(message) && /does not exist|schema cache|could not find/i.test(message)) {
          continue
        }

        if (process.env.NODE_ENV !== 'production') {
          console.warn('Supabase product-by-slug fetch failed:', message)
        }
        break
      }

      if (data) {
        return transformDbProduct(data as unknown as DbProduct)
      }
    } catch {
      // ignore and try next column
    }
  }

  const seed = seedProducts.find((p) => p.slug === slug)
  return seed ? transformSeedProduct(seed) : null
}
