import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { quoteConfigurationPricing, type UsageType } from '@/lib/pricing/configuration'
import { applyRoleDiscount, type RoleDiscount } from '@/lib/pricing/roleDiscounts'
import { createPricingQuote, supabaseAdmin } from '@/lib/supabase-admin'
import { generateQuoteToken, getQuoteTtlMinutes, hashQuoteToken } from '@/lib/pricing/quote-token'

const VAT_RATE = 0.21

type IncomingItem = {
  id: string
  name?: string
  slug?: string
  quantity: number
  basePrice?: number
  color?: string
  finish?: string
  configuration?: {
    usageType?: UsageType
    profileVariantId?: string
    colorVariantId?: string
    thicknessOptionId?: string
    thicknessMm?: number
    widthMm?: number
    lengthMm?: number
  }
}

type LockBody = {
  items: IncomingItem[]
}

async function resolveThicknessOptionIdFromMm(thicknessMm: number): Promise<string | null> {
  if (!supabaseAdmin) return null
  if (!Number.isFinite(thicknessMm) || thicknessMm <= 0) return null

  const { data, error } = await supabaseAdmin
    .from('catalog_options')
    .select('id')
    .eq('option_type', 'thickness')
    .eq('value_mm', Math.round(thicknessMm))
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null
  return typeof (data as any).id === 'string' ? (data as any).id : null
}

function createSupabaseRouteClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op in route handlers
        },
      },
    }
  )
}

async function getAuthenticatedRoleDiscount(request: NextRequest): Promise<RoleDiscount | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const supabase = createSupabaseRouteClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).maybeSingle()

  const role = (profile as any)?.role as string | undefined
  if (!role) return null

  const { data: discountRow } = await supabase
    .from('role_discounts')
    .select('role,discount_type,discount_value,currency,is_active')
    .eq('role', role)
    .eq('is_active', true)
    .maybeSingle()

  return (discountRow as RoleDiscount | null) ?? null
}

function centsFromEur(value: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

function eurFromCents(cents: number): number {
  return Math.round(cents) / 100
}

function computeShippingGrossCents(itemsGrossSubtotalCents: number): number {
  // Keep in sync with checkout/order.
  return itemsGrossSubtotalCents > 50000 ? 0 : 1500
}

function splitGrossCents(totalGrossCents: number): { subtotalNetCents: number; vatCents: number } {
  if (totalGrossCents <= 0) return { subtotalNetCents: 0, vatCents: 0 }
  const vatCents = Math.round(totalGrossCents * (VAT_RATE / (1 + VAT_RATE)))
  const subtotalNetCents = totalGrossCents - vatCents
  return { subtotalNetCents, vatCents }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = (await req.json().catch(() => null)) as LockBody | null
    const itemsRaw = Array.isArray(body?.items) ? body!.items : []
    if (itemsRaw.length === 0) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 })
    }

    const items = itemsRaw
      .map((item) => ({
        id: String(item.id || '').trim(),
        name: typeof item.name === 'string' ? item.name.trim() : undefined,
        slug: typeof item.slug === 'string' ? item.slug : undefined,
        quantity: Number(item.quantity) || 0,
        color: typeof item.color === 'string' ? item.color : undefined,
        finish: typeof item.finish === 'string' ? item.finish : undefined,
        configuration:
          item && typeof (item as any).configuration === 'object' && (item as any).configuration !== null
            ? {
                usageType: typeof (item as any).configuration.usageType === 'string' ? (item as any).configuration.usageType : undefined,
                profileVariantId:
                  typeof (item as any).configuration.profileVariantId === 'string'
                    ? (item as any).configuration.profileVariantId
                    : undefined,
                colorVariantId:
                  typeof (item as any).configuration.colorVariantId === 'string' ? (item as any).configuration.colorVariantId : undefined,
                thicknessOptionId:
                  typeof (item as any).configuration.thicknessOptionId === 'string'
                    ? (item as any).configuration.thicknessOptionId
                    : undefined,
                thicknessMm: typeof (item as any).configuration.thicknessMm === 'number' ? (item as any).configuration.thicknessMm : undefined,
                widthMm: typeof (item as any).configuration.widthMm === 'number' ? (item as any).configuration.widthMm : undefined,
                lengthMm: typeof (item as any).configuration.lengthMm === 'number' ? (item as any).configuration.lengthMm : undefined,
              }
            : undefined,
      }))
      .filter((i) => i.id.length > 0 && i.quantity > 0)

    if (!items.length) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 })
    }

    // Apply role discount only for authenticated users.
    const roleDiscount = await getAuthenticatedRoleDiscount(req)

    // Load product base/sale prices in one query.
    const productIds = Array.from(new Set(items.map((i) => i.id)))
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id,name,name_en,base_price,sale_price,is_active')
      .in('id', productIds)

    if (error) {
      console.error('Pricing lock: failed to load products', error)
      return NextResponse.json({ error: 'Nepavyko apskaičiuoti kainos' }, { status: 500 })
    }

    const byId = new Map<string, any>()
    for (const p of (products as any[]) || []) {
      if (p && typeof p.id === 'string') byId.set(p.id, p)
    }

    const pricedLines = await Promise.all(
      items.map(async (item) => {
        const product = byId.get(item.id)
        const productName = typeof product?.name === 'string' ? product.name : item.name || 'Produktas'

        // Configurable pricing (length/area) when dimensions present.
        const cfg = item.configuration
        const hasDimensions = cfg && typeof cfg.widthMm === 'number' && typeof cfg.lengthMm === 'number'

        let unitPriceEur: number | null = null
        let resolvedBy: any = null

        if (hasDimensions) {
          const resolvedThicknessOptionId =
            typeof cfg?.thicknessOptionId === 'string'
              ? cfg.thicknessOptionId
              : typeof cfg?.thicknessMm === 'number'
                ? await resolveThicknessOptionIdFromMm(cfg.thicknessMm)
                : null

          const quote = await quoteConfigurationPricing({
            productId: item.id,
            usageType: cfg?.usageType,
            profileVariantId: cfg?.profileVariantId,
            colorVariantId: cfg?.colorVariantId,
            thicknessOptionId: resolvedThicknessOptionId ?? undefined,
            widthMm: cfg!.widthMm as number,
            lengthMm: cfg!.lengthMm as number,
            quantityBoards: 1,
          })

          if (!quote) {
            return { error: 'Kaina nerasta šiai konfigūracijai', itemId: item.id }
          }

          unitPriceEur = quote.unitPricePerBoard
          resolvedBy = quote.resolvedBy
        } else {
          // Standard product pricing from catalog.
          const base = product ? Number(product.base_price) : NaN
          const sale = product && product.sale_price !== null && product.sale_price !== undefined ? Number(product.sale_price) : NaN
          const chosen = Number.isFinite(sale) && sale > 0 ? sale : Number.isFinite(base) ? base : 0
          unitPriceEur = chosen
        }

        if (roleDiscount) {
          unitPriceEur = applyRoleDiscount(unitPriceEur, roleDiscount)
        }

        const unitPriceCents = centsFromEur(unitPriceEur)
        const lineTotalCents = unitPriceCents * item.quantity

        return {
          id: item.id,
          name: productName,
          slug: item.slug,
          quantity: item.quantity,
          basePrice: eurFromCents(unitPriceCents),
          unitPriceCents,
          lineTotalCents,
          color: item.color,
          finish: item.finish,
          configuration: item.configuration,
          resolvedBy,
        }
      })
    )

    const failures = pricedLines.filter((l: any) => l && typeof l.error === 'string')
    if (failures.length > 0) {
      return NextResponse.json({ error: failures[0].error }, { status: 400 })
    }

    const itemsGrossSubtotalCents = pricedLines.reduce((sum: number, l: any) => sum + (l.lineTotalCents || 0), 0)
    const shippingGrossCents = computeShippingGrossCents(itemsGrossSubtotalCents)

    const snapshot = shippingGrossCents > 0
      ? [
          ...pricedLines,
          {
            id: 'shipping',
            name: 'Pristatymas',
            slug: 'shipping',
            quantity: 1,
            basePrice: eurFromCents(shippingGrossCents),
            unitPriceCents: shippingGrossCents,
            lineTotalCents: shippingGrossCents,
          },
        ]
      : pricedLines

    const totalGrossCents = snapshot.reduce((sum: number, l: any) => sum + (l.lineTotalCents || 0), 0)
    const { subtotalNetCents, vatCents } = splitGrossCents(totalGrossCents)

    const quoteToken = generateQuoteToken()
    const tokenHash = hashQuoteToken(quoteToken)
    const ttlMinutes = getQuoteTtlMinutes()

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()

    const created = await createPricingQuote({
      tokenHash,
      status: 'active',
      currency: 'EUR',
      vatRate: VAT_RATE,
      subtotalGrossCents: itemsGrossSubtotalCents,
      shippingGrossCents,
      totalGrossCents,
      subtotalNetCents,
      vatCents,
      itemsSnapshot: snapshot,
      expiresAt,
    })

    if (!created) {
      return NextResponse.json({ error: 'Nepavyko apskaičiuoti kainos' }, { status: 500 })
    }

    return NextResponse.json({
      quoteToken,
      expiresAt,
      currency: 'EUR',
      totals: {
        subtotalGross: eurFromCents(itemsGrossSubtotalCents),
        shippingGross: eurFromCents(shippingGrossCents),
        totalGross: eurFromCents(totalGrossCents),
        subtotalNet: eurFromCents(subtotalNetCents),
        vatAmount: eurFromCents(vatCents),
      },
    })
  } catch (e: any) {
    console.error('Pricing lock error', e)
    return NextResponse.json({ error: 'Nepavyko apskaičiuoti kainos' }, { status: 500 })
  }
}
