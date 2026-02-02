import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.email || '';

  const primary = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });

  let data = primary.data;
  const error = primary.error;

  if (error) {
    const legacy = await supabase
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (legacy.error) {
      console.error('Error fetching orders:', legacy.error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    data = legacy.data;
  }

  return NextResponse.json({ orders: data || [] });
}
