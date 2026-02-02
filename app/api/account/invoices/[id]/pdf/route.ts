import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { DBInvoiceRow } from '@/lib/invoice/db';
import { convertDBInvoiceToInvoice } from '@/lib/invoice/db';
import { InvoicePDFGenerator } from '@/lib/invoice/pdf-generator';

type RouteParams = { id: string };
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> };

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params;
}

export async function GET(req: NextRequest, context: RouteContext) {
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

  if ((data as DBInvoiceRow).buyer_email && (data as DBInvoiceRow).buyer_email !== user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invoice = convertDBInvoiceToInvoice(data as DBInvoiceRow);
  const pdfGenerator = new InvoicePDFGenerator(invoice);
  const pdfBytes = pdfGenerator.generate();
  const pdfBody = Uint8Array.from(pdfBytes).buffer;

  return new NextResponse(pdfBody, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="saskaita_${invoice.invoiceNumber}.pdf"`,
    },
  });
}
