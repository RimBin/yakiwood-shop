import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { data, error } = await supabase
      .from('role_discounts')
      .select('role,discount_type,discount_value,currency,is_active,created_at,updated_at')
      .order('role', { ascending: true })

    if (error) return jsonError(error.message || 'Failed to fetch discounts', 500)

    return NextResponse.json({ discounts: data ?? [] })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const body = (await request.json()) as {
      role?: string
      discountType?: 'percent' | 'fixed'
      discountValue?: number
      isActive?: boolean
    }

    const role = typeof body.role === 'string' ? body.role.trim() : ''
    const discountType = body.discountType === 'fixed' ? 'fixed' : 'percent'
    const discountValue = Number(body.discountValue)
    const isActive = body.isActive !== false

    if (!role) return jsonError('Missing role', 400)
    if (!Number.isFinite(discountValue) || discountValue < 0) return jsonError('Invalid discountValue', 400)
    if (discountType === 'percent' && discountValue > 100) return jsonError('Percent must be 0-100', 400)

    const { error } = await supabase
      .from('role_discounts')
      .upsert(
        {
          role,
          discount_type: discountType,
          discount_value: discountValue,
          currency: 'EUR',
          is_active: isActive,
        },
        { onConflict: 'role' }
      )

    if (error) return jsonError(error.message || 'Failed to update discount', 500)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
