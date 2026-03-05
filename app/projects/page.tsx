import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { toLocalePath } from '@/i18n/paths';
import { getProjectLocation, getProjectSlug, getProjectTitle, normalizeProjectLocale } from '@/lib/projects/i18n';
import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';
import { getPublishedProjects } from '@/lib/projects/server';
import type { Project } from '@/types/project';

export default async function ProjectsPage() {
  const locale = await getLocale();
  const currentLocale = normalizeProjectLocale(locale);
  const basePath = toLocalePath('/projects', currentLocale);

  const loadedProjects = await getPublishedProjects(currentLocale);
  const displayProjects = loadedProjects.map((project: Project, index: number) => ({
    id: project.id || String(index + 1),
    image: project.featuredImage || project.images?.[0],
    title: getProjectTitle(project, currentLocale),
    location: getProjectLocation(project, currentLocale),
    slug: getProjectSlug(project, currentLocale),
  }));

  // Keep existing behavior (first 12 only; pagination UI not implemented).
  const currentProjects = displayProjects.slice(0, 12);

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {currentLocale === 'lt' ? 'Mūsų projektai' : 'Our projects'}
          </h1>
        </PageCover>
      </InView>

      {/* Projects Grid */}
      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[64px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
            {currentProjects.map((project, idx) => {
              const delay = 160 + ((idx % 3) * 120) + (Math.floor(idx / 3) * 80);
              if (!project.image || !project.slug) return null;
              return (
                <Link
                  key={project.id}
                  href={`${basePath}/${project.slug}`}
                  className="flex flex-col gap-[8px] hero-seq-item hero-seq-right"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className={`relative w-full overflow-hidden rounded-[12px] ${idx % 2 === 0 ? 'h-[520px]' : 'h-[330px]'}`}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
                      {project.title}
                    </p>
                    <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                      {project.location}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </InView>

      <div className="pb-[120px]" aria-hidden="true" />
    </section>
  );
}
