'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import { assets } from '@/lib/assets';
import { projects as projectsData } from '@/data/projects';
import type { Project } from '@/types/project';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import { getProjectLocation, getProjectSlug, getProjectTitle, normalizeProjectLocale } from '@/lib/projects/i18n';

const [imgProject1, imgProject2, imgProject3, imgProject4, imgProject5, imgProject6] = assets.projects;

const PROJECTS_STORAGE_KEY = 'yakiwood_projects';

function openProjectsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('yakiwood-admin', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

async function readProjectsFromBrowserStorage(): Promise<Project[]> {
  // Prefer IndexedDB (admin saves there), fallback to legacy localStorage, then seed.
  try {
    const db = await openProjectsDb();
    const fromIdb = await new Promise<unknown | null>((resolve, reject) => {
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const req = store.get(PROJECTS_STORAGE_KEY);
      req.onsuccess = () => {
        const row = req.result as { key: string; value: unknown } | undefined;
        resolve(row?.value ?? null);
      };
      req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
    });
    if (Array.isArray(fromIdb)) return fromIdb as Project[];
  } catch {
    // ignore
  }

  try {
    const legacy = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    const parsed = legacy ? (JSON.parse(legacy) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as Project[]) : projectsData;
  } catch {
    return projectsData;
  }
}

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

function getProjectHref(basePath: string, project?: Partial<Project> | null): string {
  if (project?.slug) return `${basePath}/${project.slug}`;
  return basePath;
}

function getProjectHrefLocalized(basePath: string, project: Partial<Project> | null | undefined, locale: 'lt' | 'en'): string {
  const slug = getProjectSlug(project as Project, locale);
  if (slug) return `${basePath}/${slug}`;
  return basePath;
}

export default function Projects() {
  const locale = useLocale();
  const currentLocale = normalizeProjectLocale(locale);
  const basePath = toLocalePath('/projects', currentLocale);
  const t = useTranslations('home.projects');

  const [projects, setProjects] = useState<Project[]>(projectsData);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const loaded = await readProjectsFromBrowserStorage();
      if (!cancelled) setProjects(loaded);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackImages = useMemo(
    () => [imgProject1, imgProject2, imgProject3, imgProject4, imgProject5, imgProject6],
    []
  );

  const featuredProjects = useMemo(() => {
    // Homepage grid shows 6 cards.
    // Prefer admin-marked featured projects first; then fill with the rest in original order.
    const safeProjects = Array.isArray(projects) ? projects : [];
    const featured = safeProjects.filter((p) => Boolean(p?.featured));
    const nonFeatured = safeProjects.filter((p) => !p?.featured);

    const items: Project[] = [...featured, ...nonFeatured].slice(0, 6);

    // Final fallback: seed projects (prevents empty UI on a fresh browser)
    while (items.length < 6) {
      const fallback = projectsData.length > 0 ? projectsData[items.length % projectsData.length] : undefined;
      items.push((fallback ?? projectsData[0]) as Project);
    }

    return items;
  }, [projects]);

  return (
    <section className="w-full bg-[#E1E1E1] overflow-x-hidden">
      {/* Header removed */}

      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7712 ===== */}
      <div className="xl:hidden">
        {/* Description text - Mobile */}
        <p className="px-[16px] md:px-[32px] font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[600px] mb-[24px] md:mb-[32px]">
          Žmonės, pasirinkę degintą medieną, dažnai dalinasi teigiamais įspūdžiais ir patirtimis. Jie pastebi ne tik išskirtinę išvaizdą, bet ir funkcionalumą bei ilgaamžiškumą.
        </p>

        {/* Projects Grid - Mobile: Complex masonry-like layout from Figma */}
        <div className="px-[16px] md:px-[32px] pb-[24px] md:pb-[40px]">
          {/* Row 1: Big card (267x268px + text) */}
          <Link
            href={getProjectHrefLocalized(basePath, featuredProjects[0], currentLocale)}
            className="flex flex-col gap-[8px] mb-[16px]"
          >
            <div className="h-[268px] w-full max-w-[267px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[0]) || fallbackImages[0]}
                  alt={getProjectTitle(featuredProjects[0], currentLocale) || t('fallback.project')}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                {getProjectTitle(featuredProjects[0], currentLocale) || t('fallback.title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                {getProjectLocation(featuredProjects[0], currentLocale) || t('fallback.location')}
              </p>
            </div>
          </Link>

          {/* Row 2: Middle card (230x176px) - right aligned */}
          <div className="flex justify-end mb-[16px]">
            <Link
              href={getProjectHrefLocalized(basePath, featuredProjects[1], currentLocale)}
              className="flex flex-col gap-[8px]"
            >
              <div className="h-[176px] w-full max-w-[230px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[1]) || fallbackImages[1]}
                  alt={getProjectTitle(featuredProjects[1], currentLocale) || t('fallback.project')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-full max-w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                  {getProjectTitle(featuredProjects[1], currentLocale) || t('fallback.title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                  {getProjectLocation(featuredProjects[1], currentLocale) || t('fallback.location')}
                </p>
              </div>
            </Link>
          </div>

          {/* Row 3: Large card (328x330px) - full width */}
          <Link
            href={getProjectHrefLocalized(basePath, featuredProjects[2], currentLocale)}
            className="flex flex-col gap-[8px] mb-[16px]"
          >
            <div className="h-[330px] w-full max-w-[328px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[2]) || fallbackImages[2]}
                alt={getProjectTitle(featuredProjects[2], currentLocale) || t('fallback.project')}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                {getProjectTitle(featuredProjects[2], currentLocale) || t('fallback.title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                {getProjectLocation(featuredProjects[2], currentLocale) || t('fallback.location')}
              </p>
            </div>
          </Link>

          {/* Row 4: Small card centered (175x177px) */}
          <div className="flex justify-center mb-[16px]">
            <Link
              href={getProjectHrefLocalized(basePath, featuredProjects[3], currentLocale)}
              className="flex flex-col gap-[8px]"
            >
              <div className="h-[177px] w-full max-w-[175px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[3]) || fallbackImages[3]}
                  alt={getProjectTitle(featuredProjects[3], currentLocale) || t('fallback.project')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-full max-w-[175px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                  {getProjectTitle(featuredProjects[3], currentLocale) || t('fallback.title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                  {getProjectLocation(featuredProjects[3], currentLocale) || t('fallback.location')}
                </p>
              </div>
            </Link>
          </div>

          {/* Description between projects */}
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[266px] mb-[24px]">
            Žmonės, pasirinkę degintą medieną, dažnai dalinasi teigiamais įspūdžiais ir patirtimis. Jie pastebi ne tik išskirtinę išvaizdą, bet ir funkcionalumą bei ilgaamžiškumą.
          </p>

          {/* Row 5: Middle card right aligned (230x176px) */}
          <div className="flex justify-end mb-[16px]">
            <Link
              href={getProjectHrefLocalized(basePath, featuredProjects[4], currentLocale)}
              className="flex flex-col gap-[8px]"
            >
              <div className="h-[176px] w-full max-w-[230px] rounded-[8px] relative overflow-hidden">
                <Image
                  src={getProjectCardImage(featuredProjects[4]) || fallbackImages[5]}
                  alt={getProjectTitle(featuredProjects[4], currentLocale) || t('fallback.project')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-full max-w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                  {getProjectTitle(featuredProjects[4], currentLocale) || t('fallback.title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                  {getProjectLocation(featuredProjects[4], currentLocale) || t('fallback.location')}
                </p>
              </div>
            </Link>
          </div>

          {/* Row 6: Large card (328x330px) */}
          <Link
            href={getProjectHrefLocalized(basePath, featuredProjects[5], currentLocale)}
            className="flex flex-col gap-[8px] mb-[24px]"
          >
            <div className="h-[330px] w-full max-w-[328px] rounded-[8px] relative overflow-hidden">
              <Image
                src={getProjectCardImage(featuredProjects[5]) || fallbackImages[4]}
                alt={getProjectTitle(featuredProjects[5], currentLocale) || t('fallback.project')}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] break-words">
                {getProjectTitle(featuredProjects[5], currentLocale) || t('fallback.title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] break-words">
                {getProjectLocation(featuredProjects[5], currentLocale) || t('fallback.location')}
              </p>
            </div>
          </Link>
        </div>

        {/* View All Projects Button - Mobile */}
        <div className="flex justify-center pb-[64px]">
          <Link href={basePath} className="flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              {t('viewAll')}
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden xl:block max-w-[1440px] mx-auto px-[40px] pt-[200px] pb-[120px]">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+25px)] */}
        <div className="relative h-[80px] mb-[64px]">
          <p className="absolute left-0 top-[22px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            {t('eyebrow')}
          </p>
          <p className="absolute left-[calc(25%+25px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[739px]">
            <span>{t('headline.prefix')}</span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.emphasis')}</span>
          </p>
          {/* View All Projects button */}
          <Link href={basePath} className="absolute right-0 top-[28px] flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              {t('viewAll')}
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>
        
        {/* Desktop Grid */}
        <div className="grid grid-cols-3 gap-[32px]">
          {featuredProjects.map((project, idx) => (
            <Link
              key={idx}
              href={getProjectHrefLocalized(basePath, project, currentLocale)}
              className="flex flex-col gap-[8px]"
            >
              <div
                className={`relative w-full overflow-hidden rounded-[12px] ${(() => {
                  const row = Math.floor(idx / 3);
                  const col = idx % 3;
                  const isTall = row % 2 === 0 ? col === 0 || col === 2 : col === 1;
                  return isTall ? 'h-[520px]' : 'h-[330px]';
                })()}`}
              >
                <Image
                  src={getProjectCardImage(project) || fallbackImages[idx % fallbackImages.length]}
                  alt={getProjectTitle(project, currentLocale) || t('fallback.project')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616] break-words">
                  {getProjectTitle(project, currentLocale) || t('fallback.title')}
                </p>
                <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353] break-words">
                  {getProjectLocation(project, currentLocale) || t('fallback.location')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-[48px] font-['Outfit'] text-[14px] font-light leading-[1.4] tracking-[0.14px] text-[#535353] w-[269px]">
          Žmonės, pasirinkę degintą medieną, dažnai dalinasi teigiamais įspūdžiais ir patirtimis. Jie pastebi ne tik išskirtinę išvaizdą, bet ir funkcionalumą bei ilgaamžiškumą.
        </p>
      </div>
    </section>
  );
}
