import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeCanonicalPath(input: string): string {
  const raw = (input || '').trim()
  if (!raw) return ''

  // Accept either a pathname (/foo) or a full URL (https://yakiwood.lt/foo)
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const url = new URL(raw)
      return url.pathname || '/'
    }
  } catch {
    // fall through
  }

  if (!raw.startsWith('/')) return `/${raw}`
  return raw
}

function normalizeLocale(input: unknown): 'en' | 'lt' {
  return input === 'lt' ? 'lt' : 'en'
}

export type SeoOverrideRow = {
  id: string
  canonical_path: string
  locale: 'en' | 'lt'
  enabled: boolean
  title: string | null
  description: string | null
  canonical_url: string | null
  robots_index: boolean | null
  robots_follow: boolean | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  updated_by: string | null
  updated_by_email: string | null
  updated_at: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const canonicalPath = normalizeCanonicalPath(searchParams.get('canonicalPath') || '')
    const locale = normalizeLocale(searchParams.get('locale'))

    if (!canonicalPath) return jsonError('Missing canonicalPath', 400)

    const { data, error } = await supabase
      .from('seo_overrides')
      .select(
        'id,canonical_path,locale,enabled,title,description,canonical_url,robots_index,robots_follow,og_title,og_description,og_image,twitter_title,twitter_description,twitter_image,updated_by,updated_by_email,updated_at,created_at'
      )
      .eq('canonical_path', canonicalPath)
      .eq('locale', locale)
      .maybeSingle()

    if (error) return jsonError(error.message || 'Failed to fetch override', 500)

    return NextResponse.json({ override: (data ?? null) as SeoOverrideRow | null })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(request)

    const body = (await request.json()) as {
      canonicalPath?: string
      locale?: 'en' | 'lt'
      enabled?: boolean
      title?: string | null
      description?: string | null
      canonicalUrl?: string | null
      robotsIndex?: boolean | null
      robotsFollow?: boolean | null
      ogTitle?: string | null
      ogDescription?: string | null
      ogImage?: string | null
      twitterTitle?: string | null
      twitterDescription?: string | null
      twitterImage?: string | null
    }

    const canonicalPath = normalizeCanonicalPath(body.canonicalPath || '')
    const locale = normalizeLocale(body.locale)

    if (!canonicalPath) return jsonError('Missing canonicalPath', 400)

    const enabled = body.enabled !== false

    // Basic validation (lightweight; SEO scanner will still validate output)
    const canonicalUrl = typeof body.canonicalUrl === 'string' ? body.canonicalUrl.trim() : body.canonicalUrl

    const payload = {
      canonical_path: canonicalPath,
      locale,
      enabled,

      title: typeof body.title === 'string' ? body.title.trim() : body.title,
      description: typeof body.description === 'string' ? body.description.trim() : body.description,

      canonical_url: canonicalUrl ? canonicalUrl : null,

      robots_index: typeof body.robotsIndex === 'boolean' ? body.robotsIndex : null,
      robots_follow: typeof body.robotsFollow === 'boolean' ? body.robotsFollow : null,

      og_title: typeof body.ogTitle === 'string' ? body.ogTitle.trim() : body.ogTitle,
      og_description: typeof body.ogDescription === 'string' ? body.ogDescription.trim() : body.ogDescription,
      og_image: typeof body.ogImage === 'string' ? body.ogImage.trim() : body.ogImage,

      twitter_title: typeof body.twitterTitle === 'string' ? body.twitterTitle.trim() : body.twitterTitle,
      twitter_description: typeof body.twitterDescription === 'string' ? body.twitterDescription.trim() : body.twitterDescription,
      twitter_image: typeof body.twitterImage === 'string' ? body.twitterImage.trim() : body.twitterImage,

      updated_by: user.id,
      updated_by_email: user.email ?? null,
    }

    const { data, error } = await supabase
      .from('seo_overrides')
      .upsert(payload, { onConflict: 'canonical_path,locale' })
      .select(
        'id,canonical_path,locale,enabled,title,description,canonical_url,robots_index,robots_follow,og_title,og_description,og_image,twitter_title,twitter_description,twitter_image,updated_by,updated_by_email,updated_at,created_at'
      )
      .single()

    if (error) return jsonError(error.message || 'Failed to save override', 500)

    return NextResponse.json({ override: data as SeoOverrideRow })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const canonicalPath = normalizeCanonicalPath(searchParams.get('canonicalPath') || '')
    const locale = normalizeLocale(searchParams.get('locale'))

    if (!canonicalPath) return jsonError('Missing canonicalPath', 400)

    const { error } = await supabase
      .from('seo_overrides')
      .delete()
      .eq('canonical_path', canonicalPath)
      .eq('locale', locale)

    if (error) return jsonError(error.message || 'Failed to delete override', 500)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
