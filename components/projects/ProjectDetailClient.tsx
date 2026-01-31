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
      const loaded = await readProjectsFromBrowserStorage();
      if (!cancelled) setProjects(loaded);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

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
