import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InventoryManager } from '@/lib/inventory/manager';
import type { InventoryFilters, InventoryStats } from '@/lib/inventory/types';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  // Basic JWT-ish format check (same idea as other Supabase helpers in repo)
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

// GET /api/inventory - List all inventory items with filters
export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      if (process.env.NODE_ENV !== 'production') {
        const stats: InventoryStats = {
          total_items: 0,
          in_stock: 0,
          low_stock: 0,
          out_of_stock: 0,
          total_value: 0,
        };
        return NextResponse.json({
          items: [],
          pagination: { page, limit, total: 0, pages: 1 },
          stats,
          demo: true,
          warning: 'Database not configured',
        });
      }

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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as InventoryFilters['status'] || 'all';
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        product:products(id, name, slug, image_url)
      `, { count: 'exact' })
      .order('updated_at', { ascending: false });
    
    // Apply status filter
    if (status === 'in_stock') {
      query = query.gt('quantity_available', 0);
    } else if (status === 'low_stock') {
      query = query.gt('quantity_available', 0)
        .filter('quantity_available', 'lte', supabase.from('inventory_items').select('reorder_point'));
    } else if (status === 'out_of_stock') {
      query = query.eq('quantity_available', 0);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`sku.ilike.%${search}%,location.ilike.%${search}%`);
    }
    
    // Apply location filter
    if (location) {
      query = query.eq('location', location);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: items, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Get statistics
    const { data: statsData } = await supabase
      .from('inventory_items')
      .select('quantity_available, reorder_point');
    
    const stats: InventoryStats = {
      total_items: statsData?.length || 0,
      in_stock: statsData?.filter(item => item.quantity_available > item.reorder_point).length || 0,
      low_stock: statsData?.filter(item => item.quantity_available > 0 && item.quantity_available <= item.reorder_point).length || 0,
      out_of_stock: statsData?.filter(item => item.quantity_available === 0).length || 0,
      total_value: 0, // TODO: Calculate based on product prices
    };
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Inventory API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: Request) {
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
    
    const body = await request.json();
    const {
      product_id,
      variant_id,
      sku,
      quantity_available = 0,
      reorder_point = 10,
      reorder_quantity = 50,
      location,
    } = body;
    
    // Validate required fields
    if (!product_id || !sku) {
      return NextResponse.json(
        { error: 'product_id and sku are required' },
        { status: 400 }
      );
    }
    
    // Check if SKU already exists
    const { data: existing } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('sku', sku)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }
    
    // Create inventory item
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert({
        product_id,
        variant_id,
        sku,
        quantity_available,
        reorder_point,
        reorder_quantity,
        location,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Inventory create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
