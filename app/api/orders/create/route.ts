import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  generateOrderNumber,
  supabaseAdmin,
} from '@/lib/supabase-admin';

const VAT_RATE = 0.21;

type IncomingItem = {
  id: string;
  name: string;
  slug?: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
};

type PaymentProvider = 'stripe' | 'manual';

type CreateOrderBody = {
  items: IncomingItem[];
  customer: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  deliveryNotes?: string;
  couponCode?: string;
  paymentProvider?: PaymentProvider;
};

function normalizeItems(items: IncomingItem[]): IncomingItem[] {
  return items
    .map((i) => ({
      ...i,
      quantity: Number(i.quantity) || 0,
      basePrice: Number(i.basePrice) || 0,
      name: String(i.name || '').trim(),
      id: String(i.id || '').trim(),
      slug: typeof i.slug === 'string' ? i.slug : undefined,
      color: typeof i.color === 'string' ? i.color : undefined,
      finish: typeof i.finish === 'string' ? i.finish : undefined,
    }))
    .filter((i) => i.id.length > 0 && i.name.length > 0 && i.quantity > 0 && i.basePrice >= 0);
}

function computeShippingGross(itemsGrossSubtotal: number): number {
  // Keep in sync with checkout UI.
  return itemsGrossSubtotal > 500 ? 0 : 15;
}

function computeTotalsFromGross(grossTotal: number): { subtotalNet: number; vatAmount: number; totalGross: number } {
  if (grossTotal <= 0) {
    return { subtotalNet: 0, vatAmount: 0, totalGross: 0 };
  }
  const vatAmount = grossTotal * (VAT_RATE / (1 + VAT_RATE));
  const subtotalNet = grossTotal - vatAmount;
  return { subtotalNet, vatAmount, totalGross: grossTotal };
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = (await req.json()) as CreateOrderBody;

    const items = normalizeItems(body.items || []);
    if (!items.length) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 });
    }

    const customerEmail = String(body.customer?.email || '').trim();
    const customerName = String(body.customer?.name || '').trim();
    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Trūksta pirkėjo duomenų' }, { status: 400 });
    }

    const customerPhone = typeof body.customer?.phone === 'string' ? body.customer.phone.trim() : undefined;
    const customerStreet = typeof body.customer?.address === 'string' ? body.customer.address.trim() : '';
    const customerCity = typeof body.customer?.city === 'string' ? body.customer.city.trim() : '';
    const customerPostal = typeof body.customer?.postalCode === 'string' ? body.customer.postalCode.trim() : '';
    const customerCountry = typeof body.customer?.country === 'string' ? body.customer.country.trim() : '';

    const customerAddress = [customerStreet, customerCity, customerPostal, customerCountry]
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean)
      .join(', ');

    const itemsGrossSubtotal = items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
    const shippingGross = computeShippingGross(itemsGrossSubtotal);

    const enrichedItems: IncomingItem[] = shippingGross > 0
      ? [
          ...items,
          {
            id: 'shipping',
            name: 'Pristatymas',
            slug: 'shipping',
            quantity: 1,
            basePrice: shippingGross,
          },
        ]
      : items;

    const grossTotal = enrichedItems.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
    const totals = computeTotalsFromGross(grossTotal);

    const orderNumber = generateOrderNumber();
    const paymentProvider: PaymentProvider = body.paymentProvider === 'stripe' ? 'stripe' : 'manual';

    const notesParts: string[] = [];
    if (paymentProvider === 'manual') notesParts.push('Mokėjimas: rankinis (be Stripe).');
    if (body.couponCode) notesParts.push(`Nuolaidos kodas: ${String(body.couponCode).trim()}`);
    if (body.deliveryNotes) notesParts.push(`Pastabos: ${String(body.deliveryNotes).trim()}`);

    const order = await createOrder({
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      items: enrichedItems,
      subtotal: totals.subtotalNet,
      vatAmount: totals.vatAmount,
      total: totals.totalGross,
      currency: 'EUR',
      notes: notesParts.length ? notesParts.join('\n') : undefined,
    });

    if (!order) {
      return NextResponse.json({ error: 'Nepavyko sukurti užsakymo' }, { status: 500 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        total: order.total,
        currency: order.currency,
      },
    });
  } catch (e: any) {
    console.error('Create order error:', e);
    return NextResponse.json({ error: 'Nepavyko sukurti užsakymo' }, { status: 500 });
  }
}
