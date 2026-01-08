import { Metadata } from 'next';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { getProjectBySlug, getRelatedProjects, projects } from '@/data/projects';
import { getProjectOgImage } from '@/lib/og-image';

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

  return {
    title: `${project.title} - ${project.location} | Yakiwood`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Yakiwood`,
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
      url: `https://yakiwood.lt/projects/${project.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [getProjectOgImage(ogImage)],
    },
  };
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

