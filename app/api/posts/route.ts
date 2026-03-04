import { NextRequest, NextResponse } from 'next/server'
import { blogPosts, type BlogLocale, type BlogPost } from '@/data/blog-posts'
import { createPublicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeLocale(value: string | null): BlogLocale {
  return value === 'lt' ? 'lt' : 'en'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = normalizeLocale(searchParams.get('locale'))
  const slug = (searchParams.get('slug') || '').trim()

  const supabase = createPublicClient()
  if (!supabase) {
    if (slug) {
      const post = blogPosts.find((p) => p.slug?.[locale] === slug && p.published)
      return NextResponse.json({ post: post ?? null })
    }
    return NextResponse.json({ posts: blogPosts.filter((p) => p.published) })
  }

  if (slug) {
    const column = locale === 'lt' ? 'slug_lt' : 'slug_en'
    const { data, error } = await supabase
      .from('cms_posts')
      .select('doc')
      .eq('published', true)
      .eq(column, slug)
      .maybeSingle()

    if (error) return jsonError(error.message || 'Failed to fetch post', 500)
    return NextResponse.json({ post: (data?.doc ?? null) as BlogPost | null })
  }

  const { data, error } = await supabase
    .from('cms_posts')
    .select('doc')
    .eq('published', true)
    .order('date', { ascending: false })

  if (error) return jsonError(error.message || 'Failed to fetch posts', 500)

  const posts = (data ?? []).map((row: any) => row.doc).filter(Boolean) as BlogPost[]
  return NextResponse.json({ posts })
}
