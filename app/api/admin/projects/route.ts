import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'
import type { Project } from '@/types/project'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function normalizeProjects(input: unknown): Project[] {
  if (!Array.isArray(input)) return []
  return input.filter(isRecord).map((item) => item as unknown as Project)
}

function getProjectSlugs(project: Project) {
  const slugLt =
    (typeof project.i18n?.lt?.slug === 'string' && project.i18n.lt.slug.trim()) ||
    (typeof project.slug === 'string' ? project.slug.trim() : '')

  const slugEn =
    (typeof project.i18n?.en?.slug === 'string' && project.i18n.en.slug.trim()) ||
    ''

  return { slugLt, slugEn }
}

function getProjectTitles(project: Project) {
  const titleLt =
    (typeof project.i18n?.lt?.title === 'string' && project.i18n.lt.title.trim()) ||
    (typeof project.title === 'string' ? project.title.trim() : '')

  const titleEn =
    (typeof project.i18n?.en?.title === 'string' && project.i18n.en.title.trim()) ||
    titleLt

  return { titleLt, titleEn }
}

function normalizePublished(project: Project): boolean {
  const value = (project as any)?.published
  if (typeof value === 'boolean') return value
  // Back-compat: existing seed data has no published flag; treat as published.
  return true
}

function toRow(project: Project) {
  const { slugLt, slugEn } = getProjectSlugs(project)
  const { titleLt, titleEn } = getProjectTitles(project)

  return {
    id: String(project.id || ''),
    slug_lt: slugLt,
    slug_en: slugEn,
    title_lt: titleLt,
    title_en: titleEn,
    featured: !!project.featured,
    category: typeof project.category === 'string' && project.category ? project.category : 'residential',
    published: normalizePublished(project),
    doc: { ...(project as any), published: normalizePublished(project) },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)

    const { data, error } = await supabase
      .from('cms_projects')
      .select('doc')
      .order('updated_at', { ascending: false })

    if (error) return jsonError(error.message || 'Failed to fetch projects', 500)

    const projects = (data ?? []).map((row: any) => row.doc).filter(Boolean) as Project[]
    return NextResponse.json({ projects })
  } catch (e: any) {
    const status = e instanceof AdminAuthError ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = (await request.json().catch(() => null)) as any

    const projects = normalizeProjects(body?.projects)
      .filter((p) => typeof p?.id === 'string' && p.id.trim().length > 0)
      .map((p) => ({ ...p, id: p.id.trim() }))

    const { data: existing, error: existingError } = await supabase.from('cms_projects').select('id')
    if (existingError) return jsonError(existingError.message || 'Failed to read existing projects', 500)

    const incomingIds = new Set(projects.map((p) => p.id))
    const existingIds = (existing ?? []).map((r: any) => String(r.id || '')).filter(Boolean)
    const toDelete = existingIds.filter((id) => !incomingIds.has(id))

    if (toDelete.length > 0) {
      const { error: delError } = await supabase.from('cms_projects').delete().in('id', toDelete)
      if (delError) return jsonError(delError.message || 'Failed to delete removed projects', 500)
    }

    if (projects.length > 0) {
      const rows = projects.map(toRow)
      const { error: upsertError } = await supabase.from('cms_projects').upsert(rows)
      if (upsertError) return jsonError(upsertError.message || 'Failed to save projects', 500)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e instanceof AdminAuthError ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
