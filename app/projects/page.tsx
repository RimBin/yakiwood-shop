'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Project images from Figma
const projects = [
  {
    id: 1,
    image: "https://www.figma.com/api/mcp/asset/4d64af69-b66b-4b41-a016-30695bb49a71",
    title: "Project title",
    location: "Location",
    size: "big" // 508px wide
  },
  {
    id: 2,
    image: "https://www.figma.com/api/mcp/asset/0ed89ce1-4dea-4b06-a032-fed9f16c09fb",
    title: "Project title",
    location: "Location",
    size: "small" // 328px wide
  },
  {
    id: 3,
    image: "https://www.figma.com/api/mcp/asset/92e912f5-a18a-43c2-80f5-1249cf8e99f5",
    title: "Leliju apartments",
    location: "Vilnius, Lithuania",
    size: "small"
  },
  {
    id: 4,
    image: "https://www.figma.com/api/mcp/asset/a7ae63e9-e612-41b5-a5c0-8242ba90f9cf",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 5,
    image: "https://www.figma.com/api/mcp/asset/c17de940-6b4e-4f68-ba50-7e81885fa037",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 6,
    image: "https://www.figma.com/api/mcp/asset/98c2bd55-1fc4-4834-8ac5-1d5005cb7073",
    title: "Project title",
    location: "Location",
    size: "big"
  },
  {
    id: 7,
    image: "https://www.figma.com/api/mcp/asset/4d64af69-b66b-4b41-a016-30695bb49a71",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 8,
    image: "https://www.figma.com/api/mcp/asset/98c2bd55-1fc4-4834-8ac5-1d5005cb7073",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 9,
    image: "https://www.figma.com/api/mcp/asset/a7ae63e9-e612-41b5-a5c0-8242ba90f9cf",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 10,
    image: "https://www.figma.com/api/mcp/asset/0ed89ce1-4dea-4b06-a032-fed9f16c09fb",
    title: "Project title",
    location: "Location",
    size: "big"
  },
  {
    id: 11,
    image: "https://www.figma.com/api/mcp/asset/c17de940-6b4e-4f68-ba50-7e81885fa037",
    title: "Project title",
    location: "Location",
    size: "small"
  },
  {
    id: 12,
    image: "https://www.figma.com/api/mcp/asset/92e912f5-a18a-43c2-80f5-1249cf8e99f5",
    title: "Project title",
    location: "Location",
    size: "small"
  },
];

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = 4;

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Title Section */}
      <div className="w-full border-b border-[#BBBBBB]">
        <div className="max-w-[1360px] mx-auto px-[40px] pt-[32px] pb-[48px]">
          <h1
            className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] text-[#161616] tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Our projects
          </h1>
        </div>
      </div>

      {/* Projects Grid - Masonry Layout with absolute positioning */}
      <div className="max-w-[1360px] mx-auto px-[40px] pt-[64px] relative" style={{ minHeight: '3129px' }}>
        {/* Row 1 - 3 cards */}
        {/* Card 1: Big - left (508px wide) */}
        <div className="absolute left-[40px] top-0 w-[508px] flex flex-col gap-[4px]">
          <div className="h-[520px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[0].image} alt={projects[0].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[0].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[0].location}
          </p>
        </div>

        {/* Card 2: Small - middle (328px) */}
        <div className="absolute left-[564px] top-0 w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[1].image} alt={projects[1].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[1].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[1].location}
          </p>
        </div>

        {/* Card 3: Small - right (328px) */}
        <div className="absolute left-[908px] top-0 w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[2].image} alt={projects[2].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[2].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[2].location}
          </p>
        </div>

        {/* Row 2 - Big card on right, small on left */}
        {/* Card 4: Small - left (328px) */}
        <div className="absolute left-[40px] top-[583px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[3].image} alt={projects[3].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[3].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[3].location}
          </p>
        </div>

        {/* Card 5: Big - middle-right (508px) */}
        <div className="absolute left-[384px] top-[583px] w-[508px] flex flex-col gap-[4px]">
          <div className="h-[520px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[5].image} alt={projects[5].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[5].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[5].location}
          </p>
        </div>

        {/* Card 6: Small - far right (328px) */}
        <div className="absolute left-[908px] top-[583px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[4].image} alt={projects[4].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[4].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[4].location}
          </p>
        </div>

        {/* Row 3 - 3 small cards */}
        <div className="absolute left-[40px] top-[1181px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[6].image} alt={projects[6].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[6].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[6].location}
          </p>
        </div>

        <div className="absolute left-[384px] top-[1181px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[7].image} alt={projects[7].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[7].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[7].location}
          </p>
        </div>

        {/* Row 4 - Big on left, small on right */}
        <div className="absolute left-[40px] top-[1584px] w-[508px] flex flex-col gap-[4px]">
          <div className="h-[520px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[9].image} alt={projects[9].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[9].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[9].location}
          </p>
        </div>

        <div className="absolute left-[908px] top-[1584px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[8].image} alt={projects[8].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[8].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[8].location}
          </p>
        </div>

        {/* Row 5 - 3 cards */}
        <div className="absolute left-[40px] top-[2179px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[10].image} alt={projects[10].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[10].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[10].location}
          </p>
        </div>

        <div className="absolute left-[564px] top-[2179px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[11].image} alt={projects[11].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {projects[11].title}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            {projects[11].location}
          </p>
        </div>

        <div className="absolute left-[908px] top-[2179px] w-[328px] flex flex-col gap-[4px]">
          <div className="h-[330px] w-full rounded-[8px] relative overflow-hidden">
            <Image src={projects[0].image} alt={projects[0].title} fill className="object-cover" />
          </div>
          <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Project title
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
            Location
          </p>
        </div>
      </div>

      {/* Pagination + Load More */}
      <div className="max-w-[1360px] mx-auto px-[40px]">
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
          {[1, 2, 3, 4].map((page) => (
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
