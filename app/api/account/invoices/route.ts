import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { DBInvoiceRow } from '@/lib/invoice/db';
import { convertDBInvoiceToInvoice } from '@/lib/invoice/db';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }

  const invoices = ((data as DBInvoiceRow[]) || []).map(convertDBInvoiceToInvoice);
  return NextResponse.json({ invoices });
}
