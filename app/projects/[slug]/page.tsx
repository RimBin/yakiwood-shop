import { Metadata } from 'next';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { getProjectBySlug, getRelatedProjects, projects } from '@/data/projects';
import { getProjectOgImage } from '@/lib/og-image';
import { getLocale } from 'next-intl/server';
import { toLocalePath } from '@/i18n/paths';
import { applySeoOverride } from '@/lib/seo/overrides';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project',
    };
  }

  const ogImage = project.images?.[0] || project.featuredImage;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const projectPath = toLocalePath(`/projects/${project.slug}`, currentLocale);
  const canonical = `https://yakiwood.lt${projectPath}`;

  const metadata: Metadata = {
    title: `${project.title} - ${project.location}`,
    description: project.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [
        {
          url: getProjectOgImage(ogImage),
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
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

