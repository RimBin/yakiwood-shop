// API Route: List All Invoices
// GET /api/invoices

import { NextRequest, NextResponse } from 'next/server';
import { getInvoices } from '@/lib/invoice/utils';

export async function GET(request: NextRequest) {
  try {
    const invoices = getInvoices();
    
    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
