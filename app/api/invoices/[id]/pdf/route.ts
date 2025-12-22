// API Route: Generate Invoice PDF
// GET /api/invoices/[id]/pdf

import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/invoice/utils';
import { generateInvoicePDF } from '@/lib/invoice/pdf-generator';

type RouteParams = { id: string }
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> }

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await resolveParams(context)
    const invoice = getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Generate PDF
    const pdfBytes = await generateInvoicePDF(invoice);
    const pdfBody = Uint8Array.from(pdfBytes).buffer;
    
    // Return PDF as response
    return new NextResponse(pdfBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="saskaita_${invoice.invoiceNumber}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
