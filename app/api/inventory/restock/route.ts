import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InventoryManager } from '@/lib/inventory/manager';

// POST /api/inventory/restock - Restock inventory item
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
    const { sku, quantity, reason, location, notes } = body;
    
    // Validate required fields
    if (!sku || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid SKU and positive quantity are required' },
        { status: 400 }
      );
    }
    
    // Restock the item
    await InventoryManager.restockItem(
      { sku, quantity, reason, location, notes },
      user.id
    );
    
    // Get updated inventory item
    const item = await InventoryManager.getItemBySku(sku);
    
    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${quantity} units`,
      item,
    });
  } catch (error) {
    console.error('Restock error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
