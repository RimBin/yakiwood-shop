import { NextResponse } from 'next/server';
import { supabaseAdmin, getAllInvoices } from '@/lib/supabase-admin';
import { getDemoOrderAndInvoice } from '@/lib/demo/dummy-orders';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceDemo = url.searchParams.get('demo') === '1';

    if (!supabaseAdmin) {
      if (process.env.NODE_ENV !== 'production' || forceDemo) {
        const { invoices } = getDemoOrderAndInvoice();
        return NextResponse.json({ invoices, demo: true });
      }
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const invoices = await getAllInvoices(200);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
