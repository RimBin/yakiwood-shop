import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InventoryManager } from '@/lib/inventory/manager';

// GET /api/inventory/alerts - Get inventory alerts
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved') === 'true';
    
    // Build query
    let query = supabase
      .from('inventory_alerts')
      .select(`
        *,
        inventory_item:inventory_items(
          sku,
          quantity_available,
          product:products(name, slug)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (!resolved) {
      query = query.is('resolved_at', null);
    }
    
    const { data: alerts, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/alerts/[id]/resolve - Resolve an alert
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { alertId } = body;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }
    
    await InventoryManager.resolveAlert(alertId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Alert resolved',
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
