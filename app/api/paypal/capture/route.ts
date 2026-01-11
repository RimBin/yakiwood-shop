import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, supabaseAdmin, updateOrderStatus } from '@/lib/supabase-admin'

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

function coerceString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseMoneyMajorUnits(value: unknown): number {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : typeof value === 'number' ? value : NaN
  return Number.isFinite(n) ? n : NaN
}

function approxEqual(a: number, b: number, eps = 0.01): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps
}

function extractCaptureAmount(captureData: any): { value: number; currency: string } | null {
  const purchaseUnit = Array.isArray(captureData?.purchase_units) ? captureData.purchase_units[0] : null
  const capture = Array.isArray(purchaseUnit?.payments?.captures) ? purchaseUnit.payments.captures[0] : null
  const currency = typeof capture?.amount?.currency_code === 'string' ? capture.amount.currency_code : null
  const value = parseMoneyMajorUnits(capture?.amount?.value)
  if (!currency || !Number.isFinite(value)) return null
  return { value, currency: currency.toUpperCase() }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getPayPalAccessToken()
    if (!token) {
      return NextResponse.json({ error: 'PayPal konfigūracija nerasta' }, { status: 503 })
    }

    const body = (await req.json().catch(() => null)) as
      | {
          paypalOrderId?: string
          orderId?: string
        }
      | null

    const paypalOrderId = coerceString(body?.paypalOrderId)
    const orderId = coerceString(body?.orderId)

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'Trūksta PayPal order ID' }, { status: 400 })
    }

    const captureRes = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const captureData = (await captureRes.json().catch(() => null)) as any

    if (!captureRes.ok) {
      console.error('PayPal capture error', captureRes.status, captureData)
      return NextResponse.json({ error: 'Nepavyko patvirtinti PayPal mokėjimo' }, { status: 500 })
    }

    const status = typeof captureData?.status === 'string' ? captureData.status : null

    // Best-effort: update our order state if database is configured and orderId provided.
    let updatedOrder = false
    if (orderId && supabaseAdmin) {
      const existing = await getOrderById(orderId)
      if (existing) {
        const captured = extractCaptureAmount(captureData)
        if (captured) {
          const orderCurrency = (existing.currency || 'EUR').toUpperCase()
          const orderTotal = Number(existing.total)
          if (captured.currency !== orderCurrency || !approxEqual(captured.value, orderTotal)) {
            console.error('PayPal amount mismatch', {
              orderId,
              capturedCurrency: captured.currency,
              orderCurrency,
              capturedValue: captured.value,
              orderTotal,
            })
            return NextResponse.json({ error: 'Neteisinga suma' }, { status: 400 })
          }
        }

        updatedOrder = await updateOrderStatus(existing.id, 'processing', 'paid')

        // Append a note (best-effort; does not fail capture flow).
        try {
          const existingNotes = typeof existing.notes === 'string' ? existing.notes : ''
          const noteLine = `PayPal mokėjimas: ${paypalOrderId}`
          const nextNotes = existingNotes?.trim()
            ? `${existingNotes.trim()}\n${noteLine}`
            : noteLine

          await supabaseAdmin
            .from('orders')
            .update({ notes: nextNotes })
            .eq('id', existing.id)
        } catch (e) {
          console.error('PayPal note append skipped', e)
        }
      }
    }

    return NextResponse.json({ ok: true, status, paypalOrderId, updatedOrder })
  } catch (e: any) {
    console.error('PayPal capture route error', e)
    return NextResponse.json({ error: 'Nepavyko patvirtinti PayPal mokėjimo' }, { status: 500 })
  }
}
