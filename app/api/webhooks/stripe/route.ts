import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe'; // Import type only
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';
import { createInvoice, splitGrossToNet } from '@/lib/invoice/utils';
import { 
  createOrder, 
  getOrderById,
  updateOrderStatus, 
  updateOrderStripePayment,
  saveInvoiceToDatabase,
  generateOrderNumber 
} from '@/lib/supabase-admin';
import { InventoryManager } from '@/lib/inventory/manager';
import { createInventorySkuResolveContext, resolveInventorySkuForCartItem } from '@/lib/inventory/sku.server';
import type { ReservationItem } from '@/lib/inventory/types';
import type { InvoiceGenerateRequest } from '@/types/invoice';
import { sendOrderConfirmation } from '@/lib/email';

// Lazy-load Stripe only when needed to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
}

function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return typeof secret === 'string' && secret.trim().length > 0 ? secret : null;
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
  }
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      const orderId = session.metadata?.orderId;

      // Get customer details
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = session.metadata?.customerName || session.customer_details?.name || 'Klientas';
      const customerPhone = session.metadata?.customerPhone || session.customer_details?.phone || '';
      const customerAddress = session.metadata?.customerAddress || '';
      const customerCity = session.metadata?.customerCity || '';
      const customerPostalCode = session.metadata?.customerPostalCode || '';
      const customerCountry = session.metadata?.customerCountry || 'Lietuva';
      
      if (!customerEmail) {
        console.error('No customer email found');
        return NextResponse.json({ received: true });
      }

      // Parse items from metadata
      const itemsJson = session.metadata?.items || '[]';
      let items: any[] = [];
      try {
        const parsed = JSON.parse(itemsJson);
        items = Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error('Failed to parse items from Stripe metadata');
        items = [];
      }

      // If this checkout came from an existing order, update it instead of creating a new one.
      let order: any | null = null;
      let orderNumber: string | null = null;

      if (orderId && typeof orderId === 'string' && orderId.trim().length > 0) {
        const existing = await getOrderById(orderId.trim());
        if (existing) {
          // Validate amount paid matches our stored order total (tolerate 1 cent rounding).
          const expectedCents = Math.round(Number(existing.total) * 100);
          const paidCents = typeof (session as any).amount_total === 'number' ? (session as any).amount_total : null;
          if (paidCents !== null && Number.isFinite(expectedCents) && Math.abs(paidCents - expectedCents) > 1) {
            console.error('Stripe amount mismatch', {
              orderId: existing.id,
              paidCents,
              expectedCents,
              currency: session.currency,
              orderCurrency: existing.currency,
            });
            return NextResponse.json({ received: true });
          }

          order = existing;
          orderNumber = existing.order_number;

          await updateOrderStripePayment(existing.id, {
            stripeSessionId: session.id,
            stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          });
          await updateOrderStatus(existing.id, 'processing', 'paid');

          // Prefer order items from DB (includes shipping line when created order-first)
          if (Array.isArray(existing.items) && existing.items.length > 0) {
            items = existing.items;
          }
        }
      }

      // Prices in cart/checkout are treated as GROSS (VAT included).
      const grossTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.basePrice), 0);
      const totals = splitGrossToNet(grossTotal, 0.21);

      // Fallback: Create order in database if we didn't find an existing one
      if (!order) {
        const fallbackOrderNumber = generateOrderNumber();
        orderNumber = fallbackOrderNumber;
        order = await createOrder({
          orderNumber: fallbackOrderNumber,
          stripeSessionId: session.id,
          customerEmail,
          customerName,
          customerPhone,
          customerAddress,
          items,
          subtotal: totals.net,
          vatAmount: totals.vat,
          total: totals.gross,
          currency: 'EUR',
          notes: `Stripe mokėjimas ID: ${session.payment_intent}`
        });

        if (!order) {
          console.error('Failed to create order');
          return NextResponse.json({ received: true });
        }

        // Update order to paid
        await updateOrderStatus(order.id, 'processing', 'paid');
      }

      // Best-effort inventory update (does not break webhook on failure)
      try {
        const ctx = createInventorySkuResolveContext();

        const reservationItems: ReservationItem[] = (await Promise.all(
          items
            .filter((item: any) => {
              if (item?.id === 'shipping' || item?.slug === 'shipping') return false
              return typeof item?.slug === 'string' && item.slug.trim().length > 0
            })
            .map(async (item: any) => {
            const resolved = await resolveInventorySkuForCartItem(
              {
                id: String(item.id || ''),
                color: typeof item.color === 'string' ? item.color : undefined,
                finish: typeof item.finish === 'string' ? item.finish : undefined,
                configuration: item && typeof item.configuration === 'object' && item.configuration !== null ? item.configuration : undefined,
              },
              ctx
            );

            const option = (item.color || item.finish || 'default').toString();
            const fallbackSku = typeof item.slug === 'string' && item.slug.trim().length > 0
              ? `${String(item.slug).toUpperCase()}-${option.toUpperCase()}`
              : option.toUpperCase();

            return {
              product_id: String(item.id || ''),
              sku: resolved || fallbackSku,
              quantity: Number(item.quantity) || 0,
            };
            })
        )).filter((item) => item.quantity > 0);

        if (reservationItems.length > 0) {
          await InventoryManager.reserveStock(reservationItems, order.id);
          await InventoryManager.confirmSale(order.id);
        }
      } catch (inventoryError) {
        console.error('Inventory update skipped:', inventoryError);
      }

      // Prepare invoice data
      const invoiceRequest: InvoiceGenerateRequest = {
        buyer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || undefined,
          address: customerAddress || 'Nenurodyta',
          city: customerCity,
          postalCode: customerPostalCode,
          country: customerCountry
        },
        items: items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          quantity: item.quantity,
          // basePrice is gross (incl VAT) in checkout.
          unitPrice: item.basePrice,
          vatRate: 0.21,
          unit: item.unit || undefined,
        })),
        paymentMethod: 'stripe',
        pricesIncludeVat: true,
        dueInDays: 0, // already paid
        orderId: order?.id,
        orderNumber: orderNumber || order?.order_number || undefined,
        documentTitle: 'Production - Shou sugi ban',
        notes: `Order ${orderNumber || order?.order_number || ''}. Paid via Stripe.`
      };

      // Generate invoice
      const invoice = createInvoice(invoiceRequest);
      invoice.status = 'paid'; // Mark as paid immediately
      invoice.paymentDate = new Date().toISOString();

      // Save invoice to database
      await saveInvoiceToDatabase(invoice, order.id);

      // Generate PDF
      const pdfGenerator = new InvoicePDFGenerator(invoice);
      const pdfBuffer = pdfGenerator.generate();

      // Send email with invoice attachment using universal email sender
      const emailResult = await sendOrderConfirmation(
        customerEmail,
        orderNumber || order.order_number,
        Buffer.from(pdfBuffer)
      );

      if (!emailResult.success) {
        console.error(`Failed to send email to ${customerEmail}:`, emailResult.error);
        // Don't fail webhook - order is created, just email failed
      } else {
        console.log(`Order ${orderNumber || order.order_number} processed, invoice ${invoice.invoiceNumber} sent to ${customerEmail}`);
      }
      
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Don't fail the webhook - Stripe will retry
    }
  }

  return NextResponse.json({ received: true });
}
