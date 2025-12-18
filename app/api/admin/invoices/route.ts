import { NextResponse } from 'next/server';
import { getAllInvoices } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const invoices = await getAllInvoices(200);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
