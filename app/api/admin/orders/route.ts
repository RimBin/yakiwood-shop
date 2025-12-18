import { NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const orders = await getAllOrders(200);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
