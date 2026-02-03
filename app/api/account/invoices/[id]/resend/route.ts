import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { createClient } from '@/lib/supabase/server';
import type { DBInvoiceRow } from '@/lib/invoice/db';
import { convertDBInvoiceToInvoice } from '@/lib/invoice/db';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';

type RouteParams = { id: string };
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> };

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await resolveParams(context);

  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const invoice = convertDBInvoiceToInvoice(data as DBInvoiceRow);

  const toEmail = invoice.buyer?.email;
  if (!toEmail) {
    return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
  }

  // Extra safety: ensure the invoice belongs to this session email.
  if ((user.email || '').toLowerCase() !== toEmail.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'El. pašto siuntimas nesukonfigūruotas (RESEND_API_KEY)' },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);

  const url = new URL(req.url);
  const langParam = url.searchParams.get('lang');
  const locale = langParam === 'en' ? 'en' : 'lt';

  const pdfGenerator = new InvoicePDFGenerator(invoice, { locale });
  const pdfBytes = pdfGenerator.generate();

  const from =
    process.env.SYSTEM_EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    'Yakiwood <noreply@yakiwood.lt>';

  const subject = locale === 'en'
    ? `Invoice ${invoice.invoiceNumber}`
    : `Sąskaita faktūra ${invoice.invoiceNumber}`;

  const html = locale === 'en'
    ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Invoice</h2>
        <p>Hello,</p>
        <p>Attached is invoice <strong>${invoice.invoiceNumber}</strong>.</p>
        <p>Thank you,<br/>Yakiwood</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Sąskaita faktūra</h2>
        <p>Sveiki,</p>
        <p>Prisegta sąskaita faktūra <strong>${invoice.invoiceNumber}</strong>.</p>
        <p>Ačiū,<br/>Yakiwood</p>
      </div>
    `;

  await resend.emails.send({
    from,
    to: [toEmail],
    subject,
    html,
    attachments: [
      {
        filename: locale === 'en'
          ? `invoice_${invoice.invoiceNumber}_en.pdf`
          : `saskaita_${invoice.invoiceNumber}_lt.pdf`,
        content: Buffer.from(pdfBytes),
      },
    ],
  });

  return NextResponse.json({ ok: true });
}
