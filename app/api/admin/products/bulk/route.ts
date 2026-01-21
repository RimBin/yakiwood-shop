import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

interface BulkUpdateBody {
  ids: string[]
  isActive: boolean
  hardDelete: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = (await request.json()) as Partial<BulkUpdateBody>

    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string' && id.trim()) : []
    const isActive = body.isActive
    const hardDelete = body.hardDelete === true

    if (ids.length === 0 || (!hardDelete && typeof isActive !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (hardDelete) {
      const dependentDeletes = [
        supabase.from('product_variants').delete().in('product_id', ids),
        supabase.from('product_assets').delete().in('product_id', ids),
        supabase.from('product_3d_models').delete().in('product_id', ids),
        supabase.from('product_configuration_prices').delete().in('product_id', ids),
        supabase.from('custom_configurations').delete().in('product_id', ids),
        supabase.from('inventory_items').delete().in('product_id', ids),
        supabase.from('cart_items').delete().in('product_id', ids),
        supabase.from('order_items').delete().in('product_id', ids),
      ]

      for (const result of dependentDeletes) {
        const { error } = await result
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, deleted: ids.length })
    }

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .in('id', ids)
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: data?.length ?? 0 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
