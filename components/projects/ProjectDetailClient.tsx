'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Breadcrumbs } from '@/components/ui';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectInfo from '@/components/projects/ProjectInfo';
import RelatedProjects from '@/components/projects/RelatedProjects';
import { projects as projectsData } from '@/data/projects';
import type { Project } from '@/types/project';
import { toLocalePath } from '@/i18n/paths';
import InView from '@/components/InView';
import {
  findProjectBySlug,
  getProjectDescription,
  getProjectFullDescription,
  getProjectLocation,
  getProjectSubtitle,
  getProjectTitle,
  normalizeProjectLocale,
} from '@/lib/projects/i18n';

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
  const currentLocale = normalizeProjectLocale(locale);
  const resolvedBasePath = toLocalePath(basePath, currentLocale);
  const [projects, setProjects] = useState<Project[]>(projectsData);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/projects?locale=${encodeURIComponent(currentLocale)}`);
        const json = (await res.json().catch(() => null)) as any;
        const loaded = Array.isArray(json?.projects) ? (json.projects as Project[]) : [];
        if (!cancelled && loaded.length > 0) setProjects(loaded);
      } catch {
        // keep seed fallback
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [currentLocale]);

  const project = useMemo(
    () => findProjectBySlug(projects, slug, currentLocale),
    [projects, slug, currentLocale]
  );
  const relatedProjects = useMemo(
    () => (project ? projects.filter((p) => p.id !== project.id).slice(0, 3) : []),
    [projects, project]
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
        align="left"
        />
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-16">
          <h1 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-4.4px] text-[#161616]">
            {notFoundTitle}
          </h1>
        </div>
      </main>
    );
  }

  const title = getProjectTitle(project, currentLocale);
  const subtitle = getProjectSubtitle(project, currentLocale);
  const location = getProjectLocation(project, currentLocale);
  const description = getProjectDescription(project, currentLocale);
  const fullDescription = getProjectFullDescription(project, currentLocale);

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: labels.home, href: toLocalePath('/', currentLocale) },
          { label: labels.projects, href: resolvedBasePath },
          { label: title },
        ]}
        align="left"
      />

      <InView className="hero-animate-root">
        {/* Title */}
        <div className="w-full py-8 lg:py-12 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
            <h1 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-4.4px] text-[#161616]">
              {title}
            </h1>
          </div>
        </div>

        {/* Gallery */}
        <div className="w-full mb-8 lg:mb-12 hero-seq-item hero-seq-right" style={{ animationDelay: '180ms' }}>
          <ProjectGallery images={project.images} title={title} />
        </div>

        {/* Project Information */}
        <div className="w-full mb-8 lg:mb-12 hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
          <ProjectInfo
            title={title}
            subtitle={subtitle}
            location={location}
            productsUsed={project.productsUsed}
          />
        </div>

        {/* Description */}
        <div className="w-full mb-16 lg:mb-24 hero-seq-item hero-seq-right" style={{ animationDelay: '460ms' }}>
          <div className="max-w-[671px] mx-auto px-4 lg:px-0">
            <div className="font-['Outfit'] font-light text-sm leading-[1.2] tracking-[0.14px] text-[#161616] space-y-2.5">
              <p>{description}</p>
              {fullDescription && <p>{fullDescription}</p>}
            </div>
          </div>
        </div>

        {/* Related Projects */}
        <div className="hero-seq-item hero-seq-right" style={{ animationDelay: '620ms' }}>
          <RelatedProjects projects={relatedProjects} basePath={basePath} />
        </div>
      </InView>
    </main>
  );
}
