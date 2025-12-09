import { NextRequest, NextResponse } from 'next/server'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { sanityClient } from '@/lib/sanity/client'
import { PRODUCT_LIST_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

function toNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

type SanityProduct = {
  _id: string
  name: string
  slug?: string
  basePrice?: number
  woodType?: string
  category?: string
  excerpt?: string
  heroImage?: { image?: SanityImageSource }
  gallery?: Array<{ image?: SanityImageSource }>
}

const fallbackProducts = [
  {
    id: 'demo-1',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-1',
    basePrice: 89,
    woodType: 'spruce',
    category: 'cladding',
    imageUrl: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462',
  },
  {
    id: 'demo-2',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-2',
    basePrice: 89,
    woodType: 'larch',
    category: 'cladding',
    imageUrl: 'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999',
  },
  {
    id: 'demo-3',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-3',
    basePrice: 89,
    woodType: 'spruce',
    category: 'decking',
    imageUrl: 'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0',
  },
  {
    id: 'demo-4',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-4',
    basePrice: 89,
    woodType: 'larch',
    category: 'furniture',
    imageUrl: 'https://www.figma.com/api/mcp/asset/96c4c940-c49c-4bd3-8823-483555dc24ba',
  },
]

function paginateFallback(offset: number, limit: number) {
  return fallbackProducts.slice(offset, offset + limit)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams
    const category = searchParams.get('category')
    const woodType = searchParams.get('woodType')
    const q = searchParams.get('q')
    const limit = Math.min(toNumber(searchParams.get('limit'), 50), 100)
    const offset = toNumber(searchParams.get('offset'), 0)
    if (!sanityClient) {
      return NextResponse.json({ products: paginateFallback(offset, limit) })
    }

    const products = await sanityClient.fetch<SanityProduct[]>(PRODUCT_LIST_QUERY, {
      category: category || undefined,
      woodType: woodType || undefined,
      search: q ? `*${q}*` : undefined,
      offset,
      end: offset + limit,
    })

    const normalized = products.map((item) => ({
      id: item._id,
      name: item.name,
      slug: item.slug || item._id,
      description: item.excerpt || '',
      basePrice: item.basePrice ?? 0,
      woodType: item.woodType,
      category: item.category,
      imageUrl: urlFor(item.heroImage?.image) || null,
      gallery:
        item.gallery
          ?.map((entry) => urlFor(entry.image))
          .filter((value): value is string => Boolean(value)) || [],
    }))

    return NextResponse.json({ products: normalized })
  } catch (error) {
    console.error('Sanity products error', error)
    return NextResponse.json(
      { products: paginateFallback(0, fallbackProducts.length), error: 'Unable to load products' },
      { status: 200 }
    )
  }
}
