import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure secrets are set in .env.local and Vercel env
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-11-17.clover'
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail, customerName, customerPhone, customerAddress } = body as { 
      items: Array<{ id: string; name: string; quantity: number; basePrice: number }>;
      customerEmail?: string;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe konfigūracija nerasta' }, { status: 500 });
    }

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
        items: JSON.stringify(items)
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart`
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: 'Nepavyko sukurti atsiskaitymo sesijos' }, { status: 500 });
  }
}
