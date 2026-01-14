import { Metadata } from 'next';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { projects } from '@/data/projects';
import { getProjectOgImage } from '@/lib/og-image';
import { getLocale } from 'next-intl/server';
import { toLocalePath } from '@/i18n/paths';
import { applySeoOverride } from '@/lib/seo/overrides';
import { findProjectBySlug, getProjectDescription, getProjectLocation, getProjectSlug, getProjectTitle, normalizeProjectLocale } from '@/lib/projects/i18n';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: getProjectSlug(project, 'en'),
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const currentLocale = normalizeProjectLocale(locale);
  const project = findProjectBySlug(projects, slug, currentLocale);

  if (!project) {
    return {
      title: 'Project',
    };
  }

  const title = getProjectTitle(project, currentLocale);
  const location = getProjectLocation(project, currentLocale);
  const description = getProjectDescription(project, currentLocale);
  const localizedSlug = getProjectSlug(project, currentLocale);

  const ogImage = project.images?.[0] || project.featuredImage;
  const projectPath = toLocalePath(`/projects/${localizedSlug}`, currentLocale);
  const canonical = `https://yakiwood.lt${projectPath}`;

  const metadata: Metadata = {
    title: `${title} - ${location}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: getProjectOgImage(ogImage),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getProjectOgImage(ogImage)],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  return (
    <ProjectDetailClient
      slug={slug}
      basePath="/projects"
      labels={{ home: 'Home', projects: 'Projects' }}
    />
  );
}

