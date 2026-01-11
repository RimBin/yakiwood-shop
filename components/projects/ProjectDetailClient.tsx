'use client';

import React, { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Breadcrumbs } from '@/components/ui';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectInfo from '@/components/projects/ProjectInfo';
import RelatedProjects from '@/components/projects/RelatedProjects';
import { projects as projectsData } from '@/data/projects';
import type { Project } from '@/types/project';
import { toLocalePath } from '@/i18n/paths';

function loadProjectsFromLocalStorageOrSeed(): Project[] {
  if (typeof window === 'undefined') return projectsData;

  try {
    const savedProjects = window.localStorage.getItem('yakiwood_projects');
    const loadedProjects = savedProjects ? (JSON.parse(savedProjects) as unknown) : null;
    return Array.isArray(loadedProjects) ? (loadedProjects as Project[]) : projectsData;
  } catch {
    return projectsData;
  }
}

export default function ProjectDetailClient({
  slug,
  basePath,
  labels,
}: {
  slug: string;
  basePath: string;
  labels: {
    home: string;
    projects: string;
  };
}) {
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const resolvedBasePath = toLocalePath(basePath, currentLocale);
  const [projects] = useState<Project[]>(loadProjectsFromLocalStorageOrSeed);

  const project = useMemo(() => projects.find((p) => p.slug === slug), [projects, slug]);
  const relatedProjects = useMemo(
    () => projects.filter((p) => p.slug !== slug).slice(0, 3),
    [projects, slug]
  );

  if (!project) {
    const notFoundTitle = locale === 'lt' ? 'Projektas nerastas' : 'Project not found';

    return (
      <main className="min-h-screen bg-[#E1E1E1]">
        <Breadcrumbs
          items={[
            { label: labels.home, href: toLocalePath('/', currentLocale) },
            { label: labels.projects, href: resolvedBasePath },
            { label: notFoundTitle },
          ]}
        />
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-16">
          <h1 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-4.4px] text-[#161616]">
            {notFoundTitle}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: labels.home, href: toLocalePath('/', currentLocale) },
          { label: labels.projects, href: resolvedBasePath },
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
      <RelatedProjects projects={relatedProjects} basePath={basePath} />
    </main>
  );
}
