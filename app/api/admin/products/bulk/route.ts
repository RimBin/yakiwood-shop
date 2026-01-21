import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

interface BulkUpdateBody {
  ids: string[]
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = (await request.json()) as Partial<BulkUpdateBody>

    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string' && id.trim()) : []
    const isActive = body.isActive

    if (ids.length === 0 || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
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
