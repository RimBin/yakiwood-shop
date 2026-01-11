'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projects as projectsData } from '@/data/projects';
import { PageCover } from '@/components/shared/PageLayout';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Load projects from localStorage or use default data
    const savedProjects = localStorage.getItem('yakiwood_projects');
    const loadedProjects = savedProjects ? JSON.parse(savedProjects) : projectsData;
    
    // Convert to display format
    const displayProjects = loadedProjects.map((project: any, index: number) => ({
      id: index + 1,
      image:
        project.featuredImage ||
        (Array.isArray(project.images) ? project.images[0] : project.images),
      title: project.title,
      location: project.location,
      slug: project.slug,
    }));
    
    setProjects(displayProjects);
  }, []);

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  // Get current page projects
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Title Section */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          Mūsų projektai
        </h1>
      </PageCover>

      {/* Projects Grid */}
      <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
          {currentProjects.map((project, idx) => (
            <Link key={project.id} href={`/projektai/${project.slug}`} className="flex flex-col gap-[8px]">
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
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-[8px] mt-[80px]">
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

        {/* Load More Button */}
        <div className="flex justify-center mt-[24px] pb-[120px]">
          <button className="bg-[#161616] h-[48px] px-[40px] py-[10px] rounded-[100px] flex items-center justify-center font-['Outfit'] font-normal text-white text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
}
