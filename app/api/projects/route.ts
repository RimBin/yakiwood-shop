import { NextRequest, NextResponse } from 'next/server'
import type { Project, ProjectLocale } from '@/types/project'
import { projects as seedProjects } from '@/data/projects'
import { createPublicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeLocale(value: string | null): ProjectLocale {
  return value === 'lt' ? 'lt' : 'en'
}

function getSlug(project: Project, locale: ProjectLocale): string {
  if (locale === 'lt') {
    return (project.i18n?.lt?.slug || project.slug || '').trim()
  }
  return (project.i18n?.en?.slug || '').trim()
}

function isPublished(project: Project): boolean {
  const value = (project as any)?.published
  if (typeof value === 'boolean') return value
  return true
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = normalizeLocale(searchParams.get('locale'))
  const slug = (searchParams.get('slug') || '').trim()

  const supabase = createPublicClient()
  if (!supabase) {
    const published = seedProjects.filter((p) => isPublished(p))
    if (slug) {
      const project = published.find((p) => getSlug(p, locale) === slug) || null
      return NextResponse.json({ project })
    }
    return NextResponse.json({ projects: published })
  }

  if (slug) {
    const column = locale === 'lt' ? 'slug_lt' : 'slug_en'
    const { data, error } = await supabase
      .from('cms_projects')
      .select('doc')
      .eq('published', true)
      .eq(column, slug)
      .maybeSingle()

    if (error) return jsonError(error.message || 'Failed to fetch project', 500)
    return NextResponse.json({ project: (data?.doc ?? null) as Project | null })
  }

  const { data, error } = await supabase
    .from('cms_projects')
    .select('doc')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  if (error) return jsonError(error.message || 'Failed to fetch projects', 500)

  const projects = (data ?? []).map((row: any) => row.doc).filter(Boolean) as Project[]
  return NextResponse.json({ projects })
}
