import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getInvoiceById, convertDBInvoiceToInvoice } from '@/lib/supabase-admin';
import { InvoicePDFGenerator, type InvoiceLocale } from '@/lib/invoice/pdf-generator';
import { getDemoDbInvoiceById } from '@/lib/demo/dummy-orders';

type RouteContextParams = Record<string, string | string[] | undefined>

function normalizeIdParam(raw: string | string[] | undefined): string | null {
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0] ?? null
  return null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<RouteContextParams> }
) {
  try {
    const url = new URL(req.url);
    const langParam = url.searchParams.get('lang');
    const locale: InvoiceLocale = langParam === 'en' ? 'en' : 'lt';
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

    const rawId = (await context.params).id
    const id = normalizeIdParam(rawId)
    if (!id) {
      return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
    }

    const dbInvoice = supabaseAdmin
      ? await getInvoiceById(id)
      : (process.env.NODE_ENV !== 'production' ? getDemoDbInvoiceById(id) : null);
    
    if (!dbInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = convertDBInvoiceToInvoice(dbInvoice);
    const pdfGenerator = new InvoicePDFGenerator(invoice, { locale });
    const pdfBytes = pdfGenerator.generate();
    const pdfBody = Uint8Array.from(pdfBytes).buffer;

    return new NextResponse(pdfBody, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="invoice_${invoice.invoiceNumber}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
