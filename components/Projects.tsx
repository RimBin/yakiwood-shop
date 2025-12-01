'use client';

import React from 'react';
import Image from 'next/image';

// Exact Figma assets from Projects node 790:6831
// Button arrow icon (black) from Figma button component
const imgArrow = "https://www.figma.com/api/mcp/asset/5fc9c418-8f06-4194-a435-59d3b06d4c5f";
const imgProject1 = "https://www.figma.com/api/mcp/asset/ecf49c2e-c662-4483-a9e8-32c0adceed42";
const imgProject2 = "https://www.figma.com/api/mcp/asset/fd4d6aa7-b35b-4d90-a0c9-0e5f4f4bbb55";
const imgProject3 = "https://www.figma.com/api/mcp/asset/088d1239-8987-4bc3-92d9-3f74872a95f7";
const imgProject4 = "https://www.figma.com/api/mcp/asset/27e87776-365b-4670-8852-476e5c9c0e30";
const imgProject5 = "https://www.figma.com/api/mcp/asset/b38a7c29-f0b9-4e8b-bd12-02375e43bc3b";
const imgProject6 = "https://www.figma.com/api/mcp/asset/27e65214-a303-4289-8c4e-597c871f0e4d";

type ProjectCardProps = {
  image: string;
  title: string;
  location: string;
  tall?: boolean;
};

function ProjectCard({ image, title, location, tall }: ProjectCardProps) {
  const heightClass = tall ? 'h-[520px]' : 'h-[330px]';

  return (
    <div className="flex flex-col gap-[4px]">
      <div className={`relative w-full ${heightClass} rounded-[8px] overflow-hidden`}>
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="flex flex-col gap-[4px] leading-[1.2] whitespace-pre-wrap">
        <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-[#161616]">
          {title}
        </p>
        <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px] text-[#535353]">
          {location}
        </p>
      </div>
    </div>
  );
}

export default function Projects() {
  const projects: ProjectCardProps[] = [
    { image: imgProject1, title: 'Project title', location: 'Location', tall: true },
    { image: imgProject3, title: 'Project title', location: 'Location' },
    { image: imgProject4, title: 'Leliju apartments', location: 'Vilnius, Lithuania' },
    { image: imgProject6, title: 'Project title', location: 'Location' },
    { image: imgProject2, title: 'Project title', location: 'Location', tall: true },
    { image: imgProject5, title: 'Project title', location: 'Location' },
  ];

  return (
    <section className="w-full bg-[var(--Background-Grey,#E1E1E1)]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[48px]">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-[8px] text-[#161616] font-normal">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase whitespace-nowrap">
                Projects
              </p>
              <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] whitespace-pre-wrap">
                <span>Inspiring </span>
                <span className="font-['Tiro_Tamil'] italic text-[#161616]">projects</span>
              </p>
            </div>

            <button className="flex gap-[8px] items-center px-0 py-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                View all projects
              </p>
              <div className="relative w-[24px] h-[24px]">
                <Image src={imgArrow} alt="" width={16} height={16} />
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-[16px]">
          {projects.map((project, idx) => (
            <ProjectCard key={idx} {...project} />
          ))}
        </div>

        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[320px]">
          People who have chosen charred wood often share their positive impressions and experiences. They note not only
          the exceptional appearance of the wood, but also its functionality and durability.
        </p>
      </div>
    </section>
  );
}
