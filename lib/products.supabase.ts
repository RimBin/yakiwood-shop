import { seedProducts } from '@/data/seed-products'
import { createPublicClient } from '@/lib/supabase/public'

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
  name: string
  price: number
  image: string
  category: string
  woodType?: string
  description?: string
  descriptionPortable?: any[]
  images?: string[]
  colors?: ProductColorVariant[]
  profiles?: ProductProfileVariant[]
  specifications?: Array<{ label: string; value: string }>
  inStock?: boolean
}

type DbProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: string | number
  wood_type: string | null
  category: string | null
  usage_type: string | null
  image_url: string | null
  is_active: boolean | null
  product_variants?: DbVariant[]
}

type DbVariant = {
  id: string
  name: string
  variant_type: string
  hex_color: string | null
  price_adjustment: string | number | null
  texture_url: string | null
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

function transformDbProduct(db: DbProduct): Product {
  const variants = Array.isArray(db.product_variants) ? db.product_variants : []

  const colors: ProductColorVariant[] = variants
    .filter((v) => v.variant_type === 'color')
    .map((v) => ({
      id: v.id,
      name: v.name,
      hex: v.hex_color ?? undefined,
      image: v.texture_url ?? undefined,
      priceModifier: v.price_adjustment === null ? undefined : toNumber(v.price_adjustment),
    }))

  const profiles: ProductProfileVariant[] = variants
    .filter((v) => v.variant_type === 'finish' || v.variant_type === 'profile')
    .map((v) => ({
      id: v.id,
      name: v.name,
      priceModifier: v.price_adjustment === null ? undefined : toNumber(v.price_adjustment),
      image: v.texture_url ?? undefined,
    }))

  const image = db.image_url || '/images/ui/wood/imgSpruce.png'
  const usage = db.usage_type || db.category || 'facade'

  const inStock =
    variants.length === 0
      ? true
      : variants.some((v) => (v.is_available ?? true) && (v.stock_quantity ?? 0) > 0)

  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    price: toNumber(db.base_price),
    image,
    images: db.image_url ? [db.image_url] : [],
    category: usage,
    woodType: db.wood_type ?? undefined,
    description: db.description ?? undefined,
    colors: colors.length ? colors : undefined,
    profiles: profiles.length ? profiles : undefined,
    inStock,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createPublicClient()

  if (!supabase) {
    return seedProducts.map(transformSeedProduct)
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      'id,name,slug,description,base_price,wood_type,category,usage_type,image_url,is_active,product_variants(id,name,variant_type,hex_color,price_adjustment,texture_url,stock_quantity,is_available)'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products from Supabase:', error)
    return seedProducts.map(transformSeedProduct)
  }

  if (!data || data.length === 0) {
    return []
  }

  return (data as unknown as DbProduct[]).map(transformDbProduct)
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient()

  if (!supabase) {
    const seed = seedProducts.find((p) => p.slug === slug)
    return seed ? transformSeedProduct(seed) : null
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      'id,name,slug,description,base_price,wood_type,category,usage_type,image_url,is_active,product_variants(id,name,variant_type,hex_color,price_adjustment,texture_url,stock_quantity,is_available)'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    if (error) {
      console.error('Error fetching product by slug from Supabase:', error)
    }

    const seed = seedProducts.find((p) => p.slug === slug)
    return seed ? transformSeedProduct(seed) : null
  }

  return transformDbProduct(data as unknown as DbProduct)
}
