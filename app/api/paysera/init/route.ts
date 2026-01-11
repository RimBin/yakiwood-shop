import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, supabaseAdmin } from '@/lib/supabase-admin'
import { encodePayseraData, signPayseraDataMd5 } from '@/lib/paysera/checkout'

function getPayseraConfig() {
  const projectId = process.env.PAYSERA_PROJECT_ID
  const signPassword = process.env.PAYSERA_SIGN_PASSWORD

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const resolvedSiteUrl =
    siteUrl && siteUrl.trim().length > 0 ? siteUrl.trim().replace(/\/$/, '') : 'http://localhost:3000'

  const version = (process.env.PAYSERA_VERSION || '1.6').trim()
  const test = process.env.PAYSERA_TEST === '1' || process.env.PAYSERA_TEST === 'true'

  return {
    projectId: typeof projectId === 'string' && projectId.trim() ? projectId.trim() : null,
    signPassword: typeof signPassword === 'string' && signPassword.trim() ? signPassword.trim() : null,
    resolvedSiteUrl,
    version,
    test,
  }
}

function toCentsEUR(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100)
}

export async function POST(req: NextRequest) {
  try {
    const cfg = getPayseraConfig()

    if (!cfg.projectId || !cfg.signPassword) {
      return NextResponse.json({ error: 'Paysera konfigūracija nerasta' }, { status: 503 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = (await req.json().catch(() => null)) as { orderId?: string } | null
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''

    if (!orderId) {
      return NextResponse.json({ error: 'Trūksta orderId' }, { status: 400 })
    }

    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Užsakymas nerastas' }, { status: 404 })
    }

    const amount = toCentsEUR(order.total)
    if (!amount) {
      return NextResponse.json({ error: 'Neteisinga suma' }, { status: 400 })
    }

    // Paysera request parameters (spec 1.9). All packed into `data`.
    // IMPORTANT: Paysera confirms payment only via callbackurl. Accepturl is for UX only.
    const params = {
      projectid: cfg.projectId,
      orderid: order.id, // keep stable and DB-addressable
      accepturl: `${cfg.resolvedSiteUrl}/order-confirmation?provider=paysera&order_id=${encodeURIComponent(order.id)}`,
      cancelurl: `${cfg.resolvedSiteUrl}/checkout`,
      callbackurl: `${cfg.resolvedSiteUrl}/api/webhooks/paysera`,
      version: cfg.version,
      lang: 'LIT',
      amount,
      currency: 'EUR',
      p_email: order.customer_email,
      p_firstname: order.customer_name,
      test: cfg.test ? 1 : undefined,
    }

    const data = encodePayseraData(params)
    const sign = signPayseraDataMd5(data, cfg.signPassword)

    const url = `https://www.paysera.com/pay/?data=${encodeURIComponent(data)}&sign=${encodeURIComponent(sign)}`

    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('Paysera init error', e)
    return NextResponse.json({ error: 'Nepavyko sukurti Paysera mokėjimo' }, { status: 500 })
  }
}
