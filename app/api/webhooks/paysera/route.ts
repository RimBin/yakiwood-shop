import { NextRequest } from 'next/server'
import { decodePayseraData, signPayseraDataMd5, timingSafeEqualHex } from '@/lib/paysera/checkout'
import { getOrderById, saveInvoiceToDatabase, supabaseAdmin, updateOrderStatus } from '@/lib/supabase-admin'
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator'
import { createInvoice } from '@/lib/invoice/utils'
import type { InvoiceGenerateRequest } from '@/types/invoice'
import { sendOrderConfirmation } from '@/lib/email'

function getPassword(): string | null {
  const pw = process.env.PAYSERA_SIGN_PASSWORD
  return typeof pw === 'string' && pw.trim().length > 0 ? pw.trim() : null
}

function parseMoneyMajorUnits(value: string | undefined): number {
  if (!value) return NaN
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

function approxEqual(a: number, b: number, eps = 0.01): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps
}

async function handleCallback(raw: { data: string; ss1: string }) {
  // Paysera requires plain text response "OK" to mark callback received.
  // https://developers.paysera.com/en/checkout/integrations/integration-callback/1.9

  const password = getPassword()
  if (!password || !supabaseAdmin) {
    return new Response('Service not configured', { status: 503 })
  }

  const data = raw.data || ''
  const ss1 = raw.ss1 || ''

  if (!data) {
    return new Response('Missing data', { status: 400 })
  }

  // Signature verification (minimum required): ss1 = md5(data + password)
  if (!ss1) {
    return new Response('Missing signature', { status: 400 })
  }

  const expected = signPayseraDataMd5(data, password)
  if (!timingSafeEqualHex(expected, ss1)) {
    return new Response('Invalid signature', { status: 400 })
  }

  let params: Record<string, string>
  try {
    params = decodePayseraData(data)
  } catch (e) {
    console.error('Paysera callback decode failed', e)
    return new Response('Bad data', { status: 400 })
  }

  const status = String(params.status || '').trim()
  const orderId = String(params.orderid || '').trim()
  const isTest = String(params.test || '').trim() === '1'

  // We acknowledge callback even for non-success statuses (so Paysera does not retry forever).
  if (status !== '1') {
    return new Response('OK', { status: 200 })
  }

  // Production safety: by default ignore test callbacks.
  if (isTest && process.env.PAYSERA_ALLOW_TEST_PAYMENTS !== 'true') {
    console.warn('Paysera test callback ignored for order', orderId)
    return new Response('OK', { status: 200 })
  }

  if (!orderId) {
    return new Response('OK', { status: 200 })
  }

  const order = await getOrderById(orderId)
  if (!order) {
    console.error('Paysera callback: order not found', orderId)
    return new Response('OK', { status: 200 })
  }

  // Validate currency/amount (recommended by Paysera).
  const payCurrency = (params.pay_currency || params.request_currency || '').toUpperCase()
  const payAmount = parseMoneyMajorUnits(params.pay_amount || params.request_amount)

  if (payCurrency && payCurrency !== (order.currency || 'EUR').toUpperCase()) {
    console.error('Paysera currency mismatch', { orderId, payCurrency, orderCurrency: order.currency })
    return new Response('OK', { status: 200 })
  }

  if (Number.isFinite(payAmount) && !approxEqual(payAmount, Number(order.total))) {
    console.error('Paysera amount mismatch', { orderId, payAmount, orderTotal: order.total })
    return new Response('OK', { status: 200 })
  }

  // Idempotency: if already paid, acknowledge.
  if (order.payment_status === 'paid') {
    return new Response('OK', { status: 200 })
  }

  // Mark order paid.
  await updateOrderStatus(order.id, 'processing', 'paid')

  // Append note (best-effort).
  try {
    const requestId = params.requestid ? String(params.requestid) : ''
    const payment = params.payment ? String(params.payment) : ''
    const noteLine = `Paysera mokėjimas${requestId ? ` requestid=${requestId}` : ''}${payment ? ` payment=${payment}` : ''}`
    const existingNotes = typeof order.notes === 'string' ? order.notes : ''
    const nextNotes = existingNotes.trim() ? `${existingNotes.trim()}\n${noteLine}` : noteLine

    await supabaseAdmin.from('orders').update({ notes: nextNotes }).eq('id', order.id)
  } catch (e) {
    console.error('Paysera note append skipped', e)
  }

  // Generate invoice + email (mirrors Stripe flow)
  try {
    const buyerAddress = order.customer_address || 'Nenurodyta'
    const invoiceRequest: InvoiceGenerateRequest = {
      buyer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone || undefined,
        address: buyerAddress,
        city: '',
        postalCode: '',
        country: 'Lietuva',
      },
      items: (Array.isArray(order.items) ? order.items : []).map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        name: item.name,
        quantity: item.quantity,
        // basePrice in this app is treated as GROSS (incl VAT)
        unitPrice: item.basePrice,
        vatRate: 0.21,
        unit: item.unit || undefined,
      })),
      // Keep invoice schema compatible (no 'paysera' enum yet)
      paymentMethod: 'bank_transfer',
      pricesIncludeVat: true,
      dueInDays: 0,
      orderId: order.id,
      orderNumber: order.order_number,
      documentTitle: 'Production - Shou sugi ban',
      notes: `Order ${order.order_number}. Paid via Paysera.`,
    }

    const invoice = createInvoice(invoiceRequest)
    invoice.status = 'paid'
    invoice.paymentDate = new Date().toISOString()

    // Save invoice to DB
    await saveInvoiceToDatabase(invoice, order.id)

    const pdfGenerator = new InvoicePDFGenerator(invoice)
    const pdfBuffer = pdfGenerator.generate()

    const emailResult = await sendOrderConfirmation(
      order.customer_email,
      order.order_number,
      Buffer.from(pdfBuffer)
    )

    if (!emailResult.success) {
      console.error('Paysera email failed', emailResult.error)
    }
  } catch (e) {
    console.error('Paysera invoice/email processing failed', e)
  }

  return new Response('OK', { status: 200 })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  return handleCallback({
    data: url.searchParams.get('data') || '',
    ss1: url.searchParams.get('ss1') || '',
  })
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    return handleCallback({
      data: String(form.get('data') || ''),
      ss1: String(form.get('ss1') || ''),
    })
  }

  // Fallback: try JSON
  try {
    const body = (await req.json()) as any
    return handleCallback({
      data: String(body?.data || ''),
      ss1: String(body?.ss1 || ''),
    })
  } catch {
    return new Response('Unsupported content type', { status: 415 })
  }
}
