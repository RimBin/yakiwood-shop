import { unstable_cache } from 'next/cache';

import { projects as seedProjects } from '@/data/projects';
import { getProjectSlug } from '@/lib/projects/i18n';
import { createPublicClient } from '@/lib/supabase/public';
import type { Project, ProjectLocale } from '@/types/project';

function isPublished(project: Project): boolean {
  const value = (project as any)?.published;
  if (typeof value === 'boolean') return value;
  return true;
}

async function fetchAllPublishedProjects(): Promise<Project[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return seedProjects.filter((p) => isPublished(p));
  }

  const { data, error } = await supabase
    .from('cms_projects')
    .select('doc')
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    // Graceful fallback (avoid hard failures in pages when CMS is temporarily unavailable)
    return seedProjects.filter((p) => isPublished(p));
  }

  return (data ?? []).map((row: any) => row.doc).filter(Boolean) as Project[];
}

async function fetchPublishedProjectBySlug(locale: ProjectLocale, slug: string): Promise<Project | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const supabase = createPublicClient();
  if (!supabase) {
    const published = seedProjects.filter((p) => isPublished(p));
    return published.find((p) => getProjectSlug(p, locale) === normalizedSlug) ?? null;
  }

  const column = locale === 'lt' ? 'slug_lt' : 'slug_en';
  const { data, error } = await supabase
    .from('cms_projects')
    .select('doc')
    .eq('published', true)
    .eq(column, normalizedSlug)
    .maybeSingle();

  if (error) {
    const published = seedProjects.filter((p) => isPublished(p));
    return published.find((p) => getProjectSlug(p, locale) === normalizedSlug) ?? null;
  }

  return (data?.doc ?? null) as Project | null;
}

const getAllPublishedProjectsCached = unstable_cache(
  async () => fetchAllPublishedProjects(),
  ['cms-projects', 'published-all'],
  { revalidate: 300 }
);

const getPublishedProjectBySlugCached = unstable_cache(
  async (locale: ProjectLocale, slug: string) => fetchPublishedProjectBySlug(locale, slug),
  ['cms-projects', 'published-by-slug'],
  { revalidate: 300 }
);

export async function getPublishedProjects(locale: ProjectLocale): Promise<Project[]> {
  const projects = await getAllPublishedProjectsCached();
  // Locale doesn’t change which projects exist, but slugs/titles can be per-locale.
  // Keep filtering stable here for potential future locale-based publishing rules.
  void locale;
  return projects;
}

export async function getProjectBySlug(locale: ProjectLocale, slug: string): Promise<Project | null> {
  return getPublishedProjectBySlugCached(locale, slug);
}
