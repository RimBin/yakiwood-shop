import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getInvoiceById, convertDBInvoiceToInvoice } from '@/lib/supabase-admin';
import { InvoicePDFGenerator, type InvoiceLocale } from '@/lib/invoice/pdf-generator';
import { getDemoDbInvoiceById } from '@/lib/demo/dummy-orders';

type RouteParams = { id: string }
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> }

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params
}

// Lazy-load Resend only when needed to avoid build-time errors
function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const url = new URL(req.url);
    const langParam = url.searchParams.get('lang');
    const locale: InvoiceLocale = langParam === 'en' ? 'en' : 'lt';

    const { id } = await resolveParams(context);

    const dbInvoice = supabaseAdmin
      ? await getInvoiceById(id)
      : (process.env.NODE_ENV !== 'production' ? getDemoDbInvoiceById(id) : null);
    
    if (!dbInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!dbInvoice.buyer_email) {
      return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
    }

    const invoice = convertDBInvoiceToInvoice(dbInvoice);
    const pdfGenerator = new InvoicePDFGenerator(invoice, { locale });
    const pdfBuffer = pdfGenerator.generate();

    const subject =
      locale === 'en'
        ? `Invoice ${invoice.invoiceNumber}`
        : `Sąskaita faktūra ${invoice.invoiceNumber}`;

    const title = locale === 'en' ? 'Invoice' : 'Sąskaita faktūra';
    const greeting = locale === 'en' ? 'Hello' : 'Sveiki';
    const intro =
      locale === 'en'
        ? 'Please find your invoice attached.'
        : 'Siunčiame jūsų sąskaitą faktūrą.';
    const invoiceNumberLabel = locale === 'en' ? 'Invoice number' : 'Sąskaitos numeris';
    const dateLabel = locale === 'en' ? 'Date' : 'Data';
    const amountLabel = locale === 'en' ? 'Amount' : 'Suma';
    const attachedNote =
      locale === 'en'
        ? 'The invoice is attached as a PDF file.'
        : 'Sąskaita faktūra pridėta kaip PDF failas.';
    const questions =
      locale === 'en'
        ? 'If you have any questions, please contact us:'
        : 'Jei turite klausimų, susisiekite su mumis:';

    await resend.emails.send({
      from: 'Yakiwood <info@yakiwood.lt>',
      to: dbInvoice.buyer_email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #161616;">${title}</h2>
          <p>${greeting}, ${invoice.buyer.name},</p>
          <p>${intro}</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>${invoiceNumberLabel}:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>${dateLabel}:</strong> ${new Date(invoice.issueDate).toLocaleDateString(locale === 'en' ? 'en-GB' : 'lt-LT')}</p>
            <p style="margin: 5px 0;"><strong>${amountLabel}:</strong> ${invoice.total.toFixed(2)} €</p>
          </div>

          <p style="margin-top: 30px;">
            <strong>${attachedNote}</strong>
          </p>

          <p>${questions}<br>
          El. paštas: info@yakiwood.lt<br>
          Tel.: +370 600 00000</p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            UAB "YAKIWOOD"<br>
            Gedimino pr. 1, Vilnius<br>
            www.yakiwood.lt
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${locale === 'en' ? 'invoice' : 'saskaita'}_${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer)
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resending invoice:', error);
    return NextResponse.json({ error: 'Failed to resend invoice' }, { status: 500 });
  }
}
