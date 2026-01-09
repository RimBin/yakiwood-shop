import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersError) {
      return jsonError(usersError.message || 'Failed to list users', 500)
    }

    const users = usersData?.users ?? []
    const ids = users.map((u) => u.id)

    const { data: profiles, error: profilesError } = ids.length
      ? await supabase
          .from('user_profiles')
          .select('id,email,full_name,role,created_at,updated_at')
          .in('id', ids)
      : { data: [], error: null }

    if (profilesError) {
      return jsonError(profilesError.message || 'Failed to load user profiles', 500)
    }

    const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]))

    const merged = users.map((u) => {
      const p = profileById.get(u.id)
      return {
        id: u.id,
        email: u.email ?? p?.email ?? null,
        fullName: p?.full_name ?? (u.user_metadata as any)?.full_name ?? null,
        role: p?.role ?? 'user',
        createdAt: p?.created_at ?? u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
      }
    })

    merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

    return NextResponse.json({ users: merged })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const body = (await request.json()) as { userId?: string; role?: string }
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    const role = typeof body.role === 'string' ? body.role.trim() : ''

    if (!userId) return jsonError('Missing userId', 400)
    if (!role) return jsonError('Missing role', 400)

    const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(userId)
    if (getUserError || !authUser?.user) {
      return jsonError(getUserError?.message || 'User not found', 404)
    }

    const email = authUser.user.email ?? ''

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          email,
          role,
          full_name: (authUser.user.user_metadata as any)?.full_name ?? null,
        },
        { onConflict: 'id' }
      )

    if (upsertError) {
      return jsonError(upsertError.message || 'Failed to update role', 500)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
