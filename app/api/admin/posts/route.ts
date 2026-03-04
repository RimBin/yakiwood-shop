import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'
import type { BlogPost } from '@/data/blog-posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function normalizePosts(input: unknown): BlogPost[] {
  if (!Array.isArray(input)) return []
  return input.filter(isRecord).map((item) => item as BlogPost)
}

function toRow(post: BlogPost) {
  const slugLt = String(post?.slug?.lt ?? '')
  const slugEn = String(post?.slug?.en ?? '')

  return {
    id: String(post.id || ''),

    slug_lt: slugLt,
    slug_en: slugEn,

    title_lt: String(post?.title?.lt ?? ''),
    title_en: String(post?.title?.en ?? ''),

    excerpt_lt: String(post?.excerpt?.lt ?? ''),
    excerpt_en: String(post?.excerpt?.en ?? ''),

    category_lt: String(post?.category?.lt ?? ''),
    category_en: String(post?.category?.en ?? ''),

    hero_image: post.heroImage ? String(post.heroImage) : null,

    author: String(post.author || 'Yakiwood'),
    date: String(post.date || new Date().toISOString().slice(0, 10)),
    read_time_minutes: Number.isFinite(post.readTimeMinutes) ? post.readTimeMinutes : 4,

    published: !!post.published,

    doc: post,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { data, error } = await supabase
      .from('cms_posts')
      .select('doc')
      .order('date', { ascending: false })

    if (error) return jsonError(error.message || 'Failed to fetch posts', 500)

    const posts = (data ?? []).map((row: any) => row.doc).filter(Boolean) as BlogPost[]
    return NextResponse.json({ posts })
  } catch (e: any) {
    const status = e instanceof AdminAuthError ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = (await request.json().catch(() => null)) as any

    const posts = normalizePosts(body?.posts)
      .filter((p) => typeof p?.id === 'string' && p.id.trim().length > 0)
      .map((p) => ({ ...p, id: p.id.trim() }))

    // Fetch existing IDs so we can delete removed rows.
    const { data: existing, error: existingError } = await supabase.from('cms_posts').select('id')
    if (existingError) return jsonError(existingError.message || 'Failed to read existing posts', 500)

    const incomingIds = new Set(posts.map((p) => p.id))
    const existingIds = (existing ?? []).map((r: any) => String(r.id || '')).filter(Boolean)
    const toDelete = existingIds.filter((id) => !incomingIds.has(id))

    if (toDelete.length > 0) {
      const { error: delError } = await supabase.from('cms_posts').delete().in('id', toDelete)
      if (delError) return jsonError(delError.message || 'Failed to delete removed posts', 500)
    }

    if (posts.length > 0) {
      const rows = posts.map(toRow)
      const { error: upsertError } = await supabase.from('cms_posts').upsert(rows)
      if (upsertError) return jsonError(upsertError.message || 'Failed to save posts', 500)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e instanceof AdminAuthError ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
