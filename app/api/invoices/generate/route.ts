// API Route: Generate Invoice
// POST /api/invoices/generate

import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, saveInvoice } from '@/lib/invoice/utils';
import type { InvoiceGenerateRequest } from '@/types/invoice';

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceGenerateRequest = await request.json();
    
    // Validate required fields
    if (!body.buyer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Buyer information and items are required' },
        { status: 400 }
      );
    }
    
    // Create invoice
    const invoice = createInvoice(body);
    
    // Save to storage (localStorage on client, could be DB here)
    saveInvoice(invoice);
    
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
