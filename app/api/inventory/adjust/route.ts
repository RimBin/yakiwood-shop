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

// POST /api/inventory/adjust - Adjust inventory (corrections)
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
    const { sku, quantity, reason, notes } = body;
    
    // Validate required fields
    if (!sku || quantity === undefined || quantity === 0) {
      return NextResponse.json(
        { error: 'SKU, non-zero quantity, and reason are required' },
        { status: 400 }
      );
    }
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required for adjustments' },
        { status: 400 }
      );
    }
    
    // Adjust the inventory
    await InventoryManager.adjustInventory(
      { sku, quantity, reason, notes },
      user.id
    );
    
    // Get updated inventory item
    const item = await InventoryManager.getItemBySku(sku);
    
    return NextResponse.json({
      success: true,
      message: `Successfully adjusted inventory by ${quantity} units`,
      item,
    });
  } catch (error) {
    console.error('Adjustment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
