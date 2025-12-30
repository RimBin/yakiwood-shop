import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe'; // Import type only
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';
import { createInvoice } from '@/lib/invoice/utils';
import { 
  createOrder, 
  updateOrderStatus, 
  saveInvoiceToDatabase,
  generateOrderNumber 
} from '@/lib/supabase-admin';
import type { InvoiceGenerateRequest } from '@/types/invoice';
import { sendOrderConfirmation } from '@/lib/email';

// Lazy-load Stripe only when needed to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  
  if (!stripe) {
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
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Get customer details
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = session.metadata?.customerName || session.customer_details?.name || 'Klientas';
      const customerPhone = session.metadata?.customerPhone || session.customer_details?.phone || '';
      const customerAddress = session.metadata?.customerAddress || '';
      
      if (!customerEmail) {
        console.error('No customer email found');
        return NextResponse.json({ received: true });
      }

      // Parse items from metadata
      const itemsJson = session.metadata?.items || '[]';
      const items = JSON.parse(itemsJson);

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.basePrice), 0
      );
      const vatAmount = subtotal * 0.21;
      const total = subtotal + vatAmount;

      // Create order in database
      const orderNumber = generateOrderNumber();
      const order = await createOrder({
        orderNumber,
        stripeSessionId: session.id,
        customerEmail,
        customerName,
        customerPhone,
        customerAddress,
        items,
        subtotal,
        vatAmount,
        total,
        currency: 'EUR',
        notes: `Stripe mokėjimas ID: ${session.payment_intent}`
      });

      if (!order) {
        console.error('Failed to create order');
        return NextResponse.json({ received: true });
      }

      // Update order to paid
      await updateOrderStatus(order.id, 'processing', 'paid');

      // Prepare invoice data
      const invoiceRequest: InvoiceGenerateRequest = {
        buyer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || undefined,
          address: customerAddress || 'Nenurodyta',
          city: 'Lietuva',
          postalCode: '',
          country: 'Lietuva'
        },
        items: items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.basePrice,
          vatRate: 0.21
        })),
        paymentMethod: 'stripe',
        dueInDays: 0, // Jau apmokėta
        notes: `Užsakymas ${orderNumber}. Apmokėta per Stripe.`
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
        orderNumber,
        Buffer.from(pdfBuffer)
      );

      if (!emailResult.success) {
        console.error(`Failed to send email to ${customerEmail}:`, emailResult.error);
        // Don't fail webhook - order is created, just email failed
      } else {
        console.log(`Order ${orderNumber} created, invoice ${invoice.invoiceNumber} sent to ${customerEmail}`);
      }
      
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Don't fail the webhook - Stripe will retry
    }
  }

  return NextResponse.json({ received: true });
}
