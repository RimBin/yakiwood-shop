'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';

// Mobile assets from Figma 759:7712
const imgProject1 = "https://www.figma.com/api/mcp/asset/83f6f8ad-c66c-4ea1-ad3f-cabffc508990"; // Big image
const imgProject2 = "https://www.figma.com/api/mcp/asset/357465f5-b586-438e-a1b5-1b09ca4f2682"; // Middle
const imgProject3 = "https://www.figma.com/api/mcp/asset/51d3a8fb-7034-42b9-a018-8e10cc247fb3"; // Large
const imgProject4 = "https://www.figma.com/api/mcp/asset/c3159542-a049-4e32-acad-c4b502255656"; // Small
const imgProject5 = "https://www.figma.com/api/mcp/asset/d8315e8a-1134-4708-af25-9b89f34886a2"; // Large
const imgProject6 = "https://www.figma.com/api/mcp/asset/b4036f05-a388-4eb5-b289-dc59a61dafb8"; // Middle right

export default function Projects() {
  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7712 ===== */}
      <div className="lg:hidden">
        {/* Title Section - Mobile */}
        <div className="px-[16px] pt-[64px] pb-[16px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            Projects
          </p>
          <p className="font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616]">
            <span>Inspiring </span>
            <span className="font-['Tiro_Tamil'] italic">projects</span>
          </p>
        </div>

        {/* Description text - Mobile */}
        <p className="px-[16px] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[358px] mb-[24px]">
          People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
        </p>

        {/* Projects Grid - Mobile: Complex masonry-like layout from Figma */}
        <div className="px-[16px] pb-[24px]">
          {/* Row 1: Big card (267x268px + text) */}
          <div className="flex flex-col gap-[8px] mb-[16px]">
            <div className="h-[268px] w-[267px] rounded-[8px] relative overflow-hidden">
              <Image src={imgProject1} alt="Project" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Project title</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Location</p>
            </div>
          </div>

          {/* Row 2: Middle card (230x176px) - right aligned */}
          <div className="flex justify-end mb-[16px]">
            <div className="flex flex-col gap-[8px]">
              <div className="h-[176px] w-[230px] rounded-[8px] relative overflow-hidden">
                <Image src={imgProject2} alt="Project" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Project title</p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Location</p>
              </div>
            </div>
          </div>

          {/* Row 3: Large card (328x330px) - full width */}
          <div className="flex flex-col gap-[8px] mb-[16px]">
            <div className="h-[330px] w-[328px] rounded-[8px] relative overflow-hidden">
              <Image src={imgProject3} alt="Project" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Project title</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Location</p>
            </div>
          </div>

          {/* Row 4: Small card centered (175x177px) */}
          <div className="flex justify-center mb-[16px]">
            <div className="flex flex-col gap-[8px]">
              <div className="h-[177px] w-[175px] rounded-[8px] relative overflow-hidden">
                <Image src={imgProject4} alt="Leliju apartments" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[175px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Leliju apartments</p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Vilnius, Lithuania</p>
              </div>
            </div>
          </div>

          {/* Description between projects */}
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[266px] mb-[24px]">
            People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
          </p>

          {/* Row 5: Middle card right aligned (230x176px) */}
          <div className="flex justify-end mb-[16px]">
            <div className="flex flex-col gap-[8px]">
              <div className="h-[176px] w-[230px] rounded-[8px] relative overflow-hidden">
                <Image src={imgProject6} alt="Project" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-[8px] text-[#161616] w-[230px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Project title</p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Location</p>
              </div>
            </div>
          </div>

          {/* Row 6: Large card (328x330px) */}
          <div className="flex flex-col gap-[8px] mb-[24px]">
            <div className="h-[330px] w-[328px] rounded-[8px] relative overflow-hidden">
              <Image src={imgProject5} alt="Project" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-[8px] text-[#161616]">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">Project title</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">Location</p>
            </div>
          </div>
        </div>

        {/* View All Projects Button - Mobile */}
        <div className="flex justify-center pb-[64px]">
          <div className="flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              View all projects
            </p>
            <ArrowRight color="#161616" />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] py-[120px]">
        {/* Title Section */}
        <div className="relative h-[160px] mb-[48px]">
          <p className="absolute left-0 top-[25px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#535353]">Projects</p>
          <h2 className="absolute left-[344px] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616]">
            Inspiring <span className="font-['Tiro_Tamil'] italic">projects</span>
          </h2>
          <Link href="/projektai" className="absolute right-0 top-[25px] flex items-center gap-[12px] text-[#161616]">
            <span className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">View all projects</span>
            <ArrowRight color="#161616" />
          </Link>
        </div>

        {/* Desktop Grid */}
        <div className="grid grid-cols-3 gap-[32px]">
          {[imgProject1, imgProject2, imgProject3, imgProject4, imgProject5, imgProject6].map((img, idx) => (
            <div key={idx} className="flex flex-col gap-[8px]">
              <div className={`relative w-full overflow-hidden rounded-[12px] ${idx % 2 === 0 ? 'h-[520px]' : 'h-[330px]'}`}>
                <Image src={img} alt="Project" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">Project title</p>
                <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">Location</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[48px] font-['Outfit'] text-[14px] font-light leading-[1.4] tracking-[0.14px] text-[#535353] w-[269px]">
          People who have chosen charred wood often share their positive impressions and experiences. They note not only the exceptional appearance of the wood, but also its functionality and durability.
        </p>
      </div>
    </section>
  );
}
