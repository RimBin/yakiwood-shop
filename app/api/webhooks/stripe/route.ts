import { NextRequest, NextResponse } from 'next/server';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';
import { createInvoice } from '@/lib/invoice/utils';
import { 
  createOrder, 
  updateOrderStatus, 
  saveInvoiceToDatabase,
  generateOrderNumber 
} from '@/lib/supabase-admin';
import type { InvoiceGenerateRequest } from '@/types/invoice';

// Lazy-load Stripe and Resend only when needed to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
}

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const resend = getResendClient();
  
  if (!stripe || !resend) {
    return NextResponse.json({ error: 'Payment or email service not configured' }, { status: 503 });
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

      // Send email with invoice attachment
      await resend.emails.send({
        from: 'Yakiwood <info@yakiwood.lt>',
        to: customerEmail,
        subject: `Užsakymas ${orderNumber} - Sąskaita faktūra ${invoice.invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #161616;">Dėkojame už užsakymą!</h2>
            <p>Sveiki, ${customerName},</p>
            <p>Jūsų užsakymas sėkmingai apmokėtas. Pridedame sąskaitą faktūrą.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Užsakymo numeris:</strong> ${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Sąskaitos numeris:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(invoice.issueDate).toLocaleDateString('lt-LT')}</p>
              <p style="margin: 5px 0;"><strong>Suma:</strong> ${invoice.total.toFixed(2)} €</p>
              <p style="margin: 5px 0;"><strong>Būsena:</strong> ✅ Apmokėta</p>
            </div>

            <h3>Užsakytos prekės:</h3>
            <ul>
              ${invoice.items.map(item => `
                <li>${item.name} - ${item.quantity} vnt. × ${item.unitPrice.toFixed(2)} € = ${(item.quantity * item.unitPrice * (1 + item.vatRate)).toFixed(2)} €</li>
              `).join('')}
            </ul>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📄 Sąskaita faktūra pridėta kaip PDF failas.</strong></p>
            </div>

            <p><strong>Kiti veiksmai:</strong></p>
            <p>Jūsų užsakymas pradėtas ruošti. Apie pristatymą informuosime atskirai.</p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p>Jei turite klausimų, susisiekite su mumis:</p>
            <p>
              📧 El. paštas: <a href="mailto:info@yakiwood.lt">info@yakiwood.lt</a><br>
              📞 Tel.: +370 600 00000<br>
              🌐 <a href="https://yakiwood.lt">www.yakiwood.lt</a>
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              UAB "YAKIWOOD"<br>
              Gedimino pr. 1, Vilnius 01103<br>
              Įmonės kodas: 123456789<br>
              PVM kodas: LT123456789012
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `saskaita_${invoice.invoiceNumber}.pdf`,
            content: Buffer.from(pdfBuffer)
          }
        ]
      });

      console.log(`Order ${orderNumber} created, invoice ${invoice.invoiceNumber} generated and sent to ${customerEmail}`);
      
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Don't fail the webhook - Stripe will retry
    }
  }

  return NextResponse.json({ received: true });
}
