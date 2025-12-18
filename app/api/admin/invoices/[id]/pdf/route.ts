import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, convertDBInvoiceToInvoice } from '@/lib/supabase-admin';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbInvoice = await getInvoiceById(id);
    
    if (!dbInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = convertDBInvoiceToInvoice(dbInvoice);
    const pdfGenerator = new InvoicePDFGenerator(invoice);
    const pdfBuffer = pdfGenerator.generate();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="saskaita_${invoice.invoiceNumber}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
