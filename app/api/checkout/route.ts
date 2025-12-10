import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe konfigūracija nerasta');
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover'
    });
  }
  return stripe;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as { items: Array<{ id: string; name: string; quantity: number; basePrice: number }> };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe konfigūracija nerasta' }, { status: 500 });
    }

    const stripeClient = getStripe();

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

    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3011'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3011'}/cancel`
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: 'Nepavyko sukurti atsiskaitymo sesijos' }, { status: 500 });
  }
}
