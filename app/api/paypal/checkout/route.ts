import { NextRequest, NextResponse } from 'next/server'
import { quoteConfigurationPricing, type UsageType } from '@/lib/pricing/configuration'

type IncomingItem = {
  id: string
  name: string
  slug?: string
  quantity: number
  basePrice: number
  color?: string
  finish?: string
  configuration?: {
    usageType?: UsageType
    profileVariantId?: string
    colorVariantId?: string
    thicknessOptionId?: string
    widthMm?: number
    lengthMm?: number
  }
}

function getPayPalBaseUrl(): string {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
  return env === 'live' || env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('PayPal token error', res.status, text)
    return null
  }

  const data = (await res.json()) as { access_token?: string }
  return typeof data.access_token === 'string' ? data.access_token : null
}

async function resolveItemUnitPriceEUR(item: IncomingItem): Promise<number> {
  // Shipping and other non-product items
  if (item.id === 'shipping') return Number(item.basePrice) || 0

  const cfg = item.configuration
  const hasConfigPricingInputs =
    cfg &&
    typeof cfg.widthMm === 'number' &&
    typeof cfg.lengthMm === 'number' &&
    item.quantity > 0

  if (!hasConfigPricingInputs) {
    return Number(item.basePrice) || 0
  }

  const quote = await quoteConfigurationPricing({
    productId: item.id,
    usageType: cfg.usageType,
    profileVariantId: cfg.profileVariantId,
    colorVariantId: cfg.colorVariantId,
    thicknessOptionId: cfg.thicknessOptionId,
    widthMm: cfg.widthMm as number,
    lengthMm: cfg.lengthMm as number,
    quantityBoards: 1,
  })

  if (!quote) return Number(item.basePrice) || 0
  return quote.unitPricePerBoard
}

function formatAmountEUR(value: number): string {
  const v = Number(value)
  if (!Number.isFinite(v) || v <= 0) return '0.00'
  return v.toFixed(2)
}

export async function POST(req: NextRequest) {
  try {
    const token = await getPayPalAccessToken()
    if (!token) {
      return NextResponse.json({ error: 'PayPal konfigūracija nerasta' }, { status: 503 })
    }

    const body = (await req.json()) as {
      orderId?: string
      items: IncomingItem[]
      customer?: {
        email?: string
        name?: string
      }
    }

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const resolvedSiteUrl = siteUrl && siteUrl.trim() ? siteUrl : 'http://localhost:3000'

    const priced = await Promise.all(
      items.map(async (item) => {
        const unit = await resolveItemUnitPriceEUR(item)
        return {
          name: item.name,
          quantity: Number(item.quantity) || 0,
          unit,
        }
      })
    )

    const grossTotal = priced.reduce((sum, i) => sum + i.unit * i.quantity, 0)
    if (!Number.isFinite(grossTotal) || grossTotal <= 0) {
      return NextResponse.json({ error: 'Neteisinga suma' }, { status: 400 })
    }

    const paypalOrderRes = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: body.orderId || 'order',
            amount: {
              currency_code: 'EUR',
              value: formatAmountEUR(grossTotal),
            },
          },
        ],
        application_context: {
          brand_name: 'Yakiwood',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${resolvedSiteUrl}/order-confirmation?provider=paypal&order_id=${encodeURIComponent(body.orderId || '')}`,
          cancel_url: `${resolvedSiteUrl}/checkout`,
        },
      }),
    })

    const paypalData = (await paypalOrderRes.json().catch(() => null)) as any

    if (!paypalOrderRes.ok) {
      console.error('PayPal create order error', paypalOrderRes.status, paypalData)
      return NextResponse.json({ error: 'Nepavyko sukurti PayPal mokėjimo' }, { status: 500 })
    }

    const approvalLink = Array.isArray(paypalData?.links)
      ? paypalData.links.find((l: any) => l?.rel === 'approve')
      : null

    const url = typeof approvalLink?.href === 'string' ? approvalLink.href : null
    if (!url) {
      return NextResponse.json({ error: 'PayPal URL nerasta' }, { status: 500 })
    }

    return NextResponse.json({ url, paypalOrderId: paypalData?.id })
  } catch (e: any) {
    console.error('PayPal checkout error', e)
    return NextResponse.json({ error: 'Nepavyko sukurti PayPal sesijos' }, { status: 500 })
  }
}
