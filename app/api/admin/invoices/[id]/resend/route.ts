import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getInvoiceById, convertDBInvoiceToInvoice } from '@/lib/supabase-admin';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbInvoice = await getInvoiceById(id);
    
    if (!dbInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!dbInvoice.buyer_email) {
      return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
    }

    const invoice = convertDBInvoiceToInvoice(dbInvoice);
    const pdfGenerator = new InvoicePDFGenerator(invoice);
    const pdfBuffer = pdfGenerator.generate();

    await resend.emails.send({
      from: 'Yakiwood <info@yakiwood.lt>',
      to: dbInvoice.buyer_email,
      subject: `Sąskaita faktūra ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #161616;">Sąskaita faktūra</h2>
          <p>Sveiki, ${invoice.buyer.name},</p>
          <p>Siunčiame jūsų sąskaitą faktūrą.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Sąskaitos numeris:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(invoice.issuedAt).toLocaleDateString('lt-LT')}</p>
            <p style="margin: 5px 0;"><strong>Suma:</strong> ${invoice.total.toFixed(2)} €</p>
          </div>

          <p style="margin-top: 30px;">
            <strong>Sąskaita faktūra pridėta kaip PDF failas.</strong>
          </p>

          <p>Jei turite klausimų, susisiekite su mumis:<br>
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
          filename: `saskaita_${invoice.invoiceNumber}.pdf`,
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
