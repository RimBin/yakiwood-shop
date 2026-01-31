'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projects as projectsData } from '@/data/projects';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import { getProjectLocation, getProjectSlug, getProjectTitle, normalizeProjectLocale } from '@/lib/projects/i18n';
import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';

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

async function readProjectsFromIdb(): Promise<unknown[] | null> {
  try {
    const db = await openProjectsDb();
    return await new Promise<unknown[] | null>((resolve, reject) => {
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const req = store.get(PROJECTS_STORAGE_KEY);
      req.onsuccess = () => {
        const row = req.result as { key: string; value: unknown } | undefined;
        resolve(Array.isArray(row?.value) ? (row!.value as unknown[]) : null);
      };
      req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
    });
  } catch {
    return null;
  }
}

export default function ProjectsPage() {
  const locale = useLocale();
  const currentLocale = normalizeProjectLocale(locale);
  const basePath = toLocalePath('/projects', currentLocale);

  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const run = async () => {
      // Prefer IndexedDB (admin now saves there), fallback to legacy localStorage, then seed.
      let loadedProjects: any[] = [];

      const fromIdb = await readProjectsFromIdb();
      if (fromIdb) {
        loadedProjects = fromIdb as any[];
      } else {
        try {
          const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
          const parsed = savedProjects ? JSON.parse(savedProjects) : null;
          loadedProjects = Array.isArray(parsed) ? parsed : (projectsData as any[]);
        } catch {
          loadedProjects = projectsData as any[];
        }
      }

      const displayProjects = loadedProjects.map((project: any, index: number) => ({
        id: index + 1,
        image:
          project.featuredImage ||
          (Array.isArray(project.images) ? project.images[0] : project.images),
        title: getProjectTitle(project, currentLocale),
        location: getProjectLocation(project, currentLocale),
        slug: getProjectSlug(project, currentLocale),
      }));

      setProjects(displayProjects);
    };

    void run();
  }, [currentLocale]);

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  // Get current page projects
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

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
              return (
                <Link
                  key={project.id}
                  href={`${basePath}/${project.slug}`}
                  className="flex flex-col gap-[8px] hero-seq-item hero-seq-right"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className={`relative w-full overflow-hidden rounded-[12px] ${idx % 2 === 0 ? 'h-[520px]' : 'h-[330px]'}`}>
                    <Image src={project.image} alt={project.title} fill className="object-cover" />
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

      {/* Pagination + Load More */}
      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[120px]">
        {/* Pagination */}
        <div className="flex items-center justify-center gap-[8px] mt-[80px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          {/* Left Arrow */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-[48px] h-[48px] flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-black/5 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke={currentPage === 1 ? "#535353" : "#161616"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-[48px] h-[48px] flex items-center justify-center rounded-full font-['DM_Sans'] font-medium text-[14px] tracking-[0.42px] uppercase transition-colors ${
                currentPage === page 
                  ? 'bg-[#161616] text-white' 
                  : 'text-[#535353] hover:bg-black/5'
              }`}
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {page}
            </button>
          ))}

          {/* Right Arrow */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-[48px] h-[48px] flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-black/5 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke={currentPage === totalPages ? "#535353" : "#161616"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>


        </div>
      </InView>
    </section>
  );
}
