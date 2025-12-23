import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectInfo from '@/components/projects/ProjectInfo';
import RelatedProjects from '@/components/projects/RelatedProjects';
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
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = getRelatedProjects(params.slug);

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: 'Pagrindinis', href: '/' },
          { label: 'Projektai', href: '/projektai' },
          { label: project.title },
        ]}
      />

      {/* Title */}
      <div className="w-full py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <h1 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-4.4px] text-[#161616]">
            {project.title}
          </h1>
        </div>
      </div>

      {/* Gallery */}
      <div className="w-full mb-8 lg:mb-12">
        <ProjectGallery images={project.images} title={project.title} />
      </div>

      {/* Project Information */}
      <div className="w-full mb-8 lg:mb-12">
        <ProjectInfo
          title={project.title}
          subtitle={project.subtitle}
          location={project.location}
          productsUsed={project.productsUsed}
        />
      </div>

      {/* Description */}
      <div className="w-full mb-16 lg:mb-24">
        <div className="max-w-[671px] mx-auto px-4 lg:px-0">
          <div className="font-['Outfit'] font-light text-sm leading-[1.2] tracking-[0.14px] text-[#161616] space-y-2.5">
            <p>{project.description}</p>
            {project.fullDescription && <p>{project.fullDescription}</p>}
          </div>
        </div>
      </div>

      {/* Related Projects */}
      <RelatedProjects projects={relatedProjects} />
    </main>
  );
}
