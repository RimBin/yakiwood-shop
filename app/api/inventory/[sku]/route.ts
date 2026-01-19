import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InventoryManager } from '@/lib/inventory/manager';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(anonKey.trim());
}

function isAdminUser(user: any): boolean {
  if (!user) return false;
  if (user.user_metadata?.role === 'admin') return true;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
  return !!email && adminEmails.includes(email);
}

interface RouteParams {
  params: Promise<{
    sku: string;
  }>;
}

// GET /api/inventory/[sku] - Get inventory item details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const { sku } = await params;

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get inventory item with product details
    const { data: item, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        product:products(id, name, slug, image_url, base_price)
      `)
      .eq('sku', sku)
      .single();
    
    if (error || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    // Get recent movements
    const movements = await InventoryManager.getMovementHistory(item.id, 20);
    
    return NextResponse.json({
      item,
      movements,
    });
  } catch (error) {
    console.error('Inventory item get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[sku] - Update inventory settings
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { sku } = await params;
    const body = await request.json();
    const { reorder_point, reorder_quantity, location } = body;
    
    // Build update object
    const updateData: {
      reorder_point?: number;
      reorder_quantity?: number;
      location?: string;
    } = {};
    
    if (reorder_point !== undefined) updateData.reorder_point = reorder_point;
    if (reorder_quantity !== undefined) updateData.reorder_quantity = reorder_quantity;
    if (location !== undefined) updateData.location = location;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Update inventory item
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('sku', sku)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Inventory settings updated',
      item,
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[sku] - Delete inventory item
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { sku } = await params;
    
    // Delete inventory item
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('sku', sku);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted',
    });
  } catch (error) {
    console.error('Inventory delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
