import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { InventoryManager } from '@/lib/inventory/manager';
import type { ReservationItem } from '@/lib/inventory/types';

// Types for Stripe event data
interface CheckoutSessionMetadata {
  items?: string; // JSON stringified cart items
}

interface CartItem {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
}

// Initialize Stripe with error handling for missing env var
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
};

export async function POST(req: Request) {
  // Check for required environment variables
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error('Stripe initialization failed:', error);
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  // Get request body and signature
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found in request headers');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  // Verify webhook signature and construct event
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error handling webhook event ${event.type}:`, errorMessage);
    return NextResponse.json(
      { error: `Event handling failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - create order in Supabase
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id);

  const supabase = await createClient();

  // Extract customer details
  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name || 'Guest';
  const shippingDetails = session.shipping_details || session.customer_details;

  if (!customerEmail) {
    throw new Error('No customer email found in session');
  }

  // Parse cart items from metadata if available
  const metadata = session.metadata as CheckoutSessionMetadata;
  let cartItems: CartItem[] = [];
  
  if (metadata?.items) {
    try {
      cartItems = JSON.parse(metadata.items);
    } catch {
      console.warn('Could not parse cart items from metadata');
    }
  }

  // Calculate total amount (convert from cents to EUR)
  const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

  // Create order in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      email: customerEmail,
      status: 'confirmed',
      total_amount: totalAmount,
      currency: session.currency?.toUpperCase() || 'EUR',
      shipping_name: shippingDetails?.name || customerName,
      shipping_address: shippingDetails?.address?.line1 || '',
      shipping_city: shippingDetails?.address?.city || '',
      shipping_postal_code: shippingDetails?.address?.postal_code || '',
      shipping_country: shippingDetails?.address?.country || 'LT',
      shipping_phone: shippingDetails?.phone || null,
      stripe_checkout_session_id: session.id,
      stripe_payment_id: session.payment_intent as string,
      payment_status: 'completed',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError);
    throw new Error(`Database error: ${orderError.message}`);
  }

  console.log('Order created:', order.id);

  // Reserve stock for the order
  if (cartItems.length > 0) {
    try {
      // Convert cart items to reservation format
      const reservationItems: ReservationItem[] = cartItems.map(item => ({
        product_id: item.id,
        sku: `${item.slug.toUpperCase()}-${(item.color || 'default').toUpperCase()}`,
        quantity: item.quantity,
      }));

      await InventoryManager.reserveStock(reservationItems, order.id);
      console.log('Stock reserved for order:', order.id);
    } catch (error) {
      console.error('Failed to reserve stock:', error);
      // Log the error but don't fail the order creation
    }
  }

  // Create order items if we have cart data
  if (cartItems.length > 0 && order) {
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id, // Note: This should be a valid UUID from products table
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.basePrice,
      total_price: item.basePrice * item.quantity,
      configuration_snapshot: item.color || item.finish ? {
        color: item.color,
        finish: item.finish,
      } : null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      // Don't throw - order was created, items are secondary
    } else {
      console.log(`Created ${orderItems.length} order items`);
    }
  }

  // TODO: Send confirmation email
  // await sendOrderConfirmationEmail(customerEmail, order);

  return order;
}

/**
 * Handle successful payment - confirm sale and update inventory
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  const supabase = await createClient();

  // Find order by payment intent ID
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_id', paymentIntent.id)
    .single();

  if (order) {
    try {
      // Confirm sale - convert reservation to sale
      await InventoryManager.confirmSale(order.id);
      console.log('Sale confirmed for order:', order.id);

      // Update order status
      await supabase
        .from('orders')
        .update({ payment_status: 'completed' })
        .eq('id', order.id);
    } catch (error) {
      console.error('Failed to confirm sale:', error);
    }
  }
}

/**
 * Handle failed payment - release reserved stock
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const lastError = paymentIntent.last_payment_error;
  const errorMessage = lastError?.message || 'Unknown payment error';
  const errorCode = lastError?.code || 'unknown';

  console.error('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    errorCode,
    errorMessage,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  const supabase = await createClient();

  // Find order by payment intent ID
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_id', paymentIntent.id)
    .single();

  if (order) {
    try {
      // Release reserved stock
      await InventoryManager.releaseStock(order.id);
      console.log('Stock released for failed payment:', order.id);

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          status: 'failed',
          payment_status: 'failed' 
        })
        .eq('id', order.id);
    } catch (error) {
      console.error('Failed to release stock:', error);
    }
  }

  // TODO: Optional - send notification email to customer
  // const customerEmail = paymentIntent.receipt_email;
  // if (customerEmail) {
  //   await sendPaymentFailedEmail(customerEmail, {
  //     amount: paymentIntent.amount / 100,
  //     currency: paymentIntent.currency,
  //     errorMessage,
  //   });
  // }

  // TODO: Optional - log to monitoring service (Sentry, LogRocket, etc.)
  // capturePaymentFailure(paymentIntent);
}

// Disable body parsing for webhook (we need raw body for signature verification)
export const runtime = 'nodejs';
