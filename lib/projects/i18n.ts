import type { Project, ProjectI18nFields, ProjectLocale } from '@/types/project';

export function normalizeProjectLocale(locale: string | undefined | null): ProjectLocale {
  return locale === 'lt' ? 'lt' : 'en';
}

function getI18n(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale) {
  return project && 'i18n' in project ? project.i18n?.[locale] : undefined;
}

export function getProjectSlug(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.slug === 'string' ? i18n.slug.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.slug === 'string' ? project.slug.trim() : '';
  return legacy;
}

export function getProjectTitle(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.title === 'string' ? i18n.title.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.title === 'string' ? project.title.trim() : '';
  return legacy;
}

export function getProjectSubtitle(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string | undefined {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.subtitle === 'string' ? i18n.subtitle.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.subtitle === 'string' ? project.subtitle.trim() : '';
  return legacy || undefined;
}

export function getProjectLocation(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.location === 'string' ? i18n.location.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.location === 'string' ? project.location.trim() : '';
  return legacy;
}

export function getProjectDescription(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.description === 'string' ? i18n.description.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.description === 'string' ? project.description.trim() : '';
  return legacy;
}

export function getProjectFullDescription(project: Project | Partial<Project> | null | undefined, locale: ProjectLocale): string | undefined {
  const i18n = getI18n(project as Project, locale);
  const candidate = typeof i18n?.fullDescription === 'string' ? i18n.fullDescription.trim() : '';
  if (candidate) return candidate;

  const legacy = typeof project?.fullDescription === 'string' ? project.fullDescription.trim() : '';
  return legacy || undefined;
}

export function findProjectBySlug(projects: Project[], slug: string, locale: ProjectLocale): Project | undefined {
  const normalized = slug?.trim();
  if (!normalized) return undefined;

  // 1) Match by requested locale slug
  const direct = projects.find((p) => getProjectSlug(p, locale) === normalized);
  if (direct) return direct;

  // 2) Match by legacy slug
  const legacy = projects.find((p) => p.slug === normalized);
  if (legacy) return legacy;

  // 3) Match by the other locale slug (helps when user lands on the "wrong" language URL)
  const otherLocale: ProjectLocale = locale === 'lt' ? 'en' : 'lt';
  return projects.find((p) => getProjectSlug(p, otherLocale) === normalized);
}

export function setProjectI18n(
  base: Project,
  locale: ProjectLocale,
  fields: Partial<ProjectI18nFields>
): Project {
  const next: Project = {
    ...base,
    i18n: {
      ...(base.i18n ?? {}),
      [locale]: {
        ...(base.i18n?.[locale] ?? {}),
        ...fields,
      },
    },
  };
  return next;
}
