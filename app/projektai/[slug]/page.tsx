import { Metadata } from 'next';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { getProjectBySlug, getRelatedProjects, projects } from '@/data/projects';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: 'Projektas',
    };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <ProjectDetailClient
      slug={params.slug}
      basePath="/projects"
      labels={{ home: 'Pagrindinis', projects: 'Projektai' }}
    />
  );
}

