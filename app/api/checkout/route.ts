import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe konfigūracija nerasta' }, { status: 503 });
    }

    const body = await req.json();
    const {
      items,
      customerEmail: customerEmailRaw,
      customerName: customerNameRaw,
      customerPhone: customerPhoneRaw,
      customerAddress: customerAddressRaw,
      customer,
    } = body as {
      items: Array<{
        id: string;
        name: string;
        slug?: string;
        quantity: number;
        basePrice: number;
        color?: string;
        finish?: string;
      }>;
      customerEmail?: string;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      customer?: {
        email?: string;
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
    };

    const customerEmail = customerEmailRaw || customer?.email;
    const customerName = customerNameRaw || customer?.name;
    const customerPhone = customerPhoneRaw || customer?.phone;

    const customerCity = customer?.city || '';
    const customerPostalCode = customer?.postalCode || '';
    const customerCountry = customer?.country || '';
    const customerStreetAddress = customerAddressRaw || customer?.address || '';
    const customerAddress = [
      customerStreetAddress,
      customerCity,
      customerPostalCode,
      customerCountry,
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(', ');

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.NODE_ENV === 'production' && (!siteUrl || !siteUrl.trim())) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SITE_URL privalomas production aplinkoje' },
        { status: 500 }
      );
    }
    const resolvedSiteUrl = siteUrl || 'http://localhost:3000';

    // NOTE: Real implementation should map product IDs to Stripe Price IDs.
    // For initial scaffold we convert basePrice EUR to cents direct.
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(i => ({
      quantity: i.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(i.basePrice * 100),
        product_data: {
          name: i.name,
        }
      }
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerAddress: customerAddress || '',
        customerCity,
        customerPostalCode,
        customerCountry,
        items: JSON.stringify(items)
      },
      success_url: `${resolvedSiteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${resolvedSiteUrl}/checkout`
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: 'Nepavyko sukurti atsiskaitymo sesijos' }, { status: 500 });
  }
}
