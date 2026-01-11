'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

interface RelatedProjectsProps {
  projects: Project[];
  basePath?: string;
}

export default function RelatedProjects({ projects, basePath = '/projects' }: RelatedProjectsProps) {
  const locale = useLocale();
  if (projects.length === 0) return null;

  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const resolvedBasePath = toLocalePath(basePath, currentLocale);
  const labels =
    locale === 'lt'
      ? {
          heading: 'Susiję projektai',
          viewAll: 'Visi projektai',
        }
      : {
          heading: 'Related projects',
          viewAll: 'View all projects',
        };

  return (
    <section className="w-full px-4 lg:px-10 py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-4.4px] text-[#161616]">
            {labels.heading}
          </h2>
          <Link
            href={resolvedBasePath}
            className="hidden lg:flex items-center gap-2 font-['Outfit'] font-normal text-xs uppercase tracking-[0.6px] text-[#161616] hover:gap-3 transition-all"
          >
            {labels.viewAll}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Projects Grid - Desktop */}
        <div className="hidden lg:grid grid-cols-3 gap-4 mb-8">
          {projects.slice(0, 3).map((project, index) => {
            // Vary sizes for visual interest
            const size = index === 1 ? 'large' : index === 0 ? 'medium' : 'small';
            const height = size === 'large' ? 'h-[560px]' : size === 'medium' ? 'h-[300px]' : 'h-[400px]';

            const imageSrc = project.featuredImage || project.images?.[0];
            if (!imageSrc) return null;

            return (
              <Link
                key={project.id}
                href={`${resolvedBasePath}/${project.slug}`}
                className="group flex flex-col gap-2"
              >
                <div className={`relative ${height} w-full rounded-lg overflow-hidden`}>
                  <Image
                    src={imageSrc}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['DM_Sans'] font-medium text-lg leading-[1.2] tracking-[-0.36px] text-[#161616]">
                    {project.title}
                  </p>
                  <p className="font-['Outfit'] font-normal text-sm uppercase tracking-[0.42px] text-[#535353]">
                    {project.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Projects Grid - Mobile */}
        <div className="flex lg:hidden flex-col gap-4 mb-8">
          {projects.slice(0, 3).map((project) => {
            const imageSrc = project.featuredImage || project.images?.[0];
            if (!imageSrc) return null;

            return (
              <Link
                key={project.id}
                href={`${resolvedBasePath}/${project.slug}`}
                className="group flex flex-col gap-2"
              >
                <div className="relative h-[230px] w-full rounded overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 358px"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['DM_Sans'] font-medium text-lg leading-[1.1] tracking-[0.18px] text-[#161616]">
                    {project.title}
                  </p>
                  <p className="font-['DM_Sans'] font-normal text-sm leading-[1.1] tracking-[0.42px] text-[rgba(0,0,0,0.7)]">
                    {project.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button - Mobile */}
        <div className="flex lg:hidden items-center justify-center">
          <Link
            href={basePath}
            className="flex items-center gap-2 font-['Outfit'] font-normal text-xs uppercase tracking-[0.6px] text-[#161616] py-2"
          >
            {labels.viewAll}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

