import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const body = (await request.json()) as {
      email?: string
      password?: string
      fullName?: string
      role?: string
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const role = typeof body.role === 'string' ? body.role.trim() : 'user'

    if (!email) return jsonError('Missing email', 400)
    if (!password || password.length < 6) return jsonError('Password must be at least 6 characters', 400)

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || undefined,
      },
    })

    if (createError || !created?.user) {
      return jsonError(createError?.message || 'Failed to create user', 500)
    }

    const userId = created.user.id

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName || null,
          role,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      return jsonError(profileError.message || 'Failed to create user profile', 500)
    }

    return NextResponse.json({
      user: {
        id: userId,
        email,
        fullName: fullName || null,
        role,
      },
    })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
