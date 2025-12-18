'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import { PageCover } from '@/components/shared/PageLayout';

// Local assets
const imgProject1 = "/assets/imgProject1.jpg";
const imgProject2 = "/assets/imgProject2.jpg";
const imgProject3 = "/assets/imgProject3.jpg";
const imgProject4 = "/assets/imgProject4.jpg";
const imgProject5 = "/assets/imgProject5.jpg";
const imgProject6 = "/assets/imgProject6.jpg";

export default function Projects() {
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
