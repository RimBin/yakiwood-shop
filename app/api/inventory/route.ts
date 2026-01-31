import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { InventoryManager } from '@/lib/inventory/manager';
import type { InventoryFilters, InventoryStats } from '@/lib/inventory/types';

type StockItemProduct = {
  id: string;
  slug: string | null;
  usage_type?: string | null;
  wood_type?: string | null;
  sku?: string | null;
};

function toSlug(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function skuChunk(input: string): string {
  const v = toSlug(String(input || '')).replace(/-/g, '');
  return v ? v.toUpperCase() : 'UNKNOWN';
}

function usageSkuCode(usageType?: string | null): string {
  const v = toSlug(String(usageType || ''));
  if (v === 'facade') return 'FAC';
  if (v === 'terrace') return 'TER';
  if (v === 'interior') return 'INT';
  if (v === 'fence') return 'FEN';
  return skuChunk(v);
}

function woodSkuCode(woodType?: string | null): string {
  const v = toSlug(String(woodType || ''));
  if (v === 'spruce') return 'SP';
  if (v === 'larch') return 'LA';
  return skuChunk(v);
}

function profileSkuCode(profileCodeOrLabel?: string | null): string {
  const v = toSlug(String(profileCodeOrLabel || ''));
  if (!v) return 'NOPROFILE';
  if (v.includes('rect') || v.includes('staciakamp')) return 'RECT';
  if (v.includes('rhomb') || v.includes('romb')) return 'RHOM';
  if ((v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) && v.includes('45'))
    return 'HALF45';
  if (v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) return 'HALF';
  return skuChunk(v);
}

function colorSkuCode(colorCodeOrLabel?: string | null): string {
  const v = toSlug(String(colorCodeOrLabel || ''));
  if (!v) return 'NOCOLOR';
  return skuChunk(v);
}

function parseStockItemSlug(slug: string): { baseSlug: string; profile: string; color: string; size: string } | null {
  const parts = slug.split('--');
  if (parts.length < 4) return null;
  const [baseSlug, profile, color, size] = parts;
  if (!baseSlug || !profile || !color || !size) return null;
  return { baseSlug, profile, color, size };
}

function parseSizeToken(size: string): { widthMm?: number; lengthMm?: number } {
  const match = size.match(/(\d+)\s*[xX]\s*(\d+)/);
  if (!match) return {};
  return { widthMm: Number(match[1]), lengthMm: Number(match[2]) };
}

function buildInventorySkuFromStockItem(product: StockItemProduct): string | null {
  const slug = product.slug ? String(product.slug) : '';
  const parsed = slug ? parseStockItemSlug(slug) : null;
  if (!parsed) return null;

  const { widthMm, lengthMm } = parseSizeToken(parsed.size);
  const usage = usageSkuCode(product.usage_type);
  const wood = woodSkuCode(product.wood_type);
  const profileCode = profileSkuCode(parsed.profile);
  const colorCode = colorSkuCode(parsed.color);
  const size = widthMm && lengthMm ? `${Math.round(widthMm)}X${Math.round(lengthMm)}` : 'NOSIZE';
  const thicknessMm = product.usage_type === 'terrace' ? 28 : 20;
  const thick = thicknessMm ? `T${Math.round(thicknessMm)}` : null;

  return ['YW', usage, wood, profileCode, colorCode, size, thick].filter(Boolean).join('-');
}

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
    const dataClient = supabaseAdmin ?? supabase;
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure inventory items exist for stock-item product combinations.
    const { data: stockProducts, error: stockProductsError } = await dataClient
      .from('products')
      .select('id, slug, usage_type, wood_type, sku, is_active')
      .ilike('slug', '%--%');

    if (!stockProductsError && Array.isArray(stockProducts) && stockProducts.length > 0) {
      const baseSlugs = Array.from(
        new Set(
          stockProducts
            .map((p: any) => String(p?.slug || ''))
            .filter(Boolean)
            .map((slug: string) => slug.split('--')[0])
            .filter((base: string) => base && !base.includes('--'))
        )
      );

      let allowedBases = new Set<string>();
      if (baseSlugs.length > 0) {
        const { data: activeBases } = await dataClient
          .from('products')
          .select('slug')
          .in('slug', baseSlugs)
          .eq('is_active', true);
        allowedBases = new Set((activeBases || []).map((row: any) => String(row?.slug || '')).filter(Boolean));
      }

      const filteredStockProducts = (stockProducts as StockItemProduct[]).filter((p) => {
        const slug = String(p.slug || '');
        const base = slug.split('--')[0];
        return !base || base.includes('--') ? false : allowedBases.has(base);
      });

      const stockProductIds = filteredStockProducts.map((p) => p.id).filter(Boolean);
      if (stockProductIds.length > 0) {
        const { data: existingInventory } = await dataClient
          .from('inventory_items')
          .select('id, product_id, sku')
          .in('product_id', stockProductIds);

        const existingByProduct = new Set((existingInventory || []).map((row: any) => String(row?.product_id || '')).filter(Boolean));

        const missingRows = filteredStockProducts
          .filter((p) => !existingByProduct.has(p.id))
          .map((p) => {
            const sku = (p.sku && String(p.sku).trim()) || buildInventorySkuFromStockItem(p) || String(p.slug || p.id);
            return {
              product_id: p.id,
              variant_id: null,
              sku,
              quantity_available: 0,
              quantity_reserved: 0,
              quantity_sold: 0,
              reorder_point: 10,
              reorder_quantity: 50,
              location: null,
            };
          });

        if (missingRows.length > 0) {
          await dataClient.from('inventory_items').upsert(missingRows, { onConflict: 'sku' });
        }
      }
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as InventoryFilters['status'] || 'all';
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Build query
    let query = dataClient
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
    const { data: statsData } = await dataClient
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
