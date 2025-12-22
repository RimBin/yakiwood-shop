import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import type { Invoice } from '@/types/invoice';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { invoice?: Invoice };
    const invoice = body?.invoice;

    if (!invoice) {
      return NextResponse.json({ error: 'Trūksta sąskaitos duomenų' }, { status: 400 });
    }

    const toEmail = invoice.buyer?.email;
    if (!toEmail) {
      return NextResponse.json({ error: 'Trūksta pirkėjo el. pašto' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'El. pašto siuntimas nesukonfigūruotas (RESEND_API_KEY)' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const pdfGenerator = new InvoicePDFGenerator(invoice);
    const pdfBytes = pdfGenerator.generate();

    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    await resend.emails.send({
      from,
      to: [toEmail],
      subject: `Sąskaita faktūra ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Sąskaita faktūra</h2>
          <p>Sveiki,</p>
          <p>Prisegta sąskaita faktūra <strong>${invoice.invoiceNumber}</strong>.</p>
          <p>Ačiū,<br/>Yakiwood</p>
        </div>
      `,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Nepavyko išsiųsti sąskaitos el. paštu' }, { status: 500 });
  }
}
