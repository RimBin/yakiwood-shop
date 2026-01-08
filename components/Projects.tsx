'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import { PageCover } from '@/components/shared/PageLayout';
import { assets } from '@/lib/assets';
import { projects as projectsData } from '@/data/projects';
import type { Project } from '@/types/project';
import { useLocale } from 'next-intl';

const [imgProject1, imgProject2, imgProject3, imgProject4, imgProject5, imgProject6] = assets.projects;

function getProjectCardImage(project?: Partial<Project> | null): string | undefined {
  if (!project) return undefined;

  if (typeof project.featuredImage === 'string' && project.featuredImage.trim()) {
    return project.featuredImage;
  }

  if (Array.isArray(project.images) && typeof project.images[0] === 'string') {
    return project.images[0];
  }

  return undefined;
}

function getProjectHref(basePath: '/projects' | '/projektai', project?: Partial<Project> | null): string {
  if (project?.slug) return `${basePath}/${project.slug}`;
  return basePath;
}

export default function Projects() {
  const locale = useLocale();
  const basePath: '/projects' | '/projektai' = locale === 'en' ? '/projects' : '/projektai';

  const [projects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return projectsData;
    try {
      const savedProjects = window.localStorage.getItem('yakiwood_projects');
      const loadedProjects = savedProjects ? (JSON.parse(savedProjects) as unknown) : null;
      return Array.isArray(loadedProjects) ? (loadedProjects as Project[]) : projectsData;
    } catch {
      return projectsData;
    }
  });

  const fallbackImages = useMemo(
    () => [imgProject1, imgProject2, imgProject3, imgProject4, imgProject5, imgProject6],
    []
  );

  const featuredProjects = useMemo(() => {
    // Preserve layout that expects 6 items
    const items = projects.slice(0, 6);
    while (items.length < 6) {
      items.push(projectsData[items.length] as Project);
    }
    return items;
  }, [projects]);

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page Header */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          Our projects
        </h1>
      </PageCover>
      
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7712 ===== */}
      <div className="lg:hidden">
        {/* Description text - Mobile */}
        <p className="px-[16px] md:px-[32px] font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[600px] mb-[24px] md:mb-[32px]">
          People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
        </p>

        {/* Projects Grid - Mobile: Complex masonry-like layout from Figma */}
        <div className="px-[16px] md:px-[32px] pb-[24px] md:pb-[40px]">
          {/* Row 1: Big card (267x268px + text) */}
          <Link href={getProjectHref(basePath, featuredProjects[0])} className="flex flex-col gap-[8px] mb-[16px]">
            <div className="h-[268px] w-[267px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[0]) || fallbackImages[0]}
                alt={featuredProjects[0]?.title || 'Project'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                {featuredProjects[0]?.title || 'Project title'}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                {featuredProjects[0]?.location || 'Location'}
              </p>
            </div>
          </Link>

          {/* Row 2: Middle card (230x176px) - right aligned */}
          <div className="flex justify-end mb-[16px]">
            <Link href={getProjectHref(basePath, featuredProjects[1])} className="flex flex-col gap-[8px]">
              <div className="h-[176px] w-[230px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[1]) || fallbackImages[1]}
                  alt={featuredProjects[1]?.title || 'Project'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                  {featuredProjects[1]?.title || 'Project title'}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                  {featuredProjects[1]?.location || 'Location'}
                </p>
              </div>
            </Link>
          </div>

          {/* Row 3: Large card (328x330px) - full width */}
          <Link href={getProjectHref(basePath, featuredProjects[2])} className="flex flex-col gap-[8px] mb-[16px]">
            <div className="h-[330px] w-[328px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[2]) || fallbackImages[2]}
                alt={featuredProjects[2]?.title || 'Project'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                {featuredProjects[2]?.title || 'Project title'}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                {featuredProjects[2]?.location || 'Location'}
              </p>
            </div>
          </Link>

          {/* Row 4: Small card centered (175x177px) */}
          <div className="flex justify-center mb-[16px]">
            <Link href={getProjectHref(basePath, featuredProjects[3])} className="flex flex-col gap-[8px]">
              <div className="h-[177px] w-[175px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[3]) || fallbackImages[3]}
                  alt={featuredProjects[3]?.title || 'Project'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[175px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                  {featuredProjects[3]?.title || 'Project title'}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                  {featuredProjects[3]?.location || 'Location'}
                </p>
              </div>
            </Link>
          </div>

          {/* Description between projects */}
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[266px] mb-[24px]">
            People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
          </p>

          {/* Row 5: Middle card right aligned (230x176px) */}
          <div className="flex justify-end mb-[16px]">
            <Link href={getProjectHref(basePath, featuredProjects[4])} className="flex flex-col gap-[8px]">
              <div className="h-[176px] w-[230px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[4]) || fallbackImages[5]}
                  alt={featuredProjects[4]?.title || 'Project'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                  {featuredProjects[4]?.title || 'Project title'}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                  {featuredProjects[4]?.location || 'Location'}
                </p>
              </div>
            </Link>
          </div>

          {/* Row 6: Large card (328x330px) */}
          <Link href={getProjectHref(basePath, featuredProjects[5])} className="flex flex-col gap-[8px] mb-[24px]">
            <div className="h-[330px] w-[328px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[5]) || fallbackImages[4]}
                alt={featuredProjects[5]?.title || 'Project'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">
                {featuredProjects[5]?.title || 'Project title'}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                {featuredProjects[5]?.location || 'Location'}
              </p>
            </div>
          </Link>
        </div>

        {/* View All Projects Button - Mobile */}
        <div className="flex justify-center pb-[64px]">
          <Link href={basePath} className="flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              View all projects
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] py-[120px]">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+25px)] */}
        <div className="relative h-[80px] mb-[64px]">
          <p className="absolute left-0 top-[22px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            Projects
          </p>
          <p className="absolute left-[calc(25%+25px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[739px]">
            <span>Inspiring </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">projects</span>
          </p>
          {/* View All Projects button */}
          <Link href={basePath} className="absolute right-0 top-[28px] flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              View all projects
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>
        
        {/* Desktop Grid */}
        <div className="grid grid-cols-3 gap-[32px]">
          {featuredProjects.map((project, idx) => (
            <Link key={idx} href={getProjectHref(basePath, project)} className="flex flex-col gap-[8px]">
              <div className={`relative w-full overflow-hidden rounded-[12px] ${idx % 2 === 0 ? 'h-[520px]' : 'h-[330px]'}`}> 
                <Image
                  src={getProjectCardImage(project) || fallbackImages[idx]}
                  alt={project?.title || 'Project'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">
                  {project?.title || 'Project title'}
                </p>
                <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                  {project?.location || 'Location'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-[48px] font-['Outfit'] text-[14px] font-light leading-[1.4] tracking-[0.14px] text-[#535353] w-[269px]">
          People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
        </p>
      </div>
    </section>
  );
}
