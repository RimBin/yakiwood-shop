import { NextResponse } from 'next/server';
import { supabaseAdmin, getAllOrders, updateOrderStatus } from '@/lib/supabase-admin';
import { getDemoOrderAndInvoice } from '@/lib/demo/dummy-orders';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceDemo = url.searchParams.get('demo') === '1';

    if (!supabaseAdmin) {
      if (process.env.NODE_ENV !== 'production' || forceDemo) {
        const { orders } = getDemoOrderAndInvoice();
        return NextResponse.json({ orders, demo: true });
      }
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const orders = await getAllOrders(200);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await updateOrderStatus(orderId, status);
    
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
