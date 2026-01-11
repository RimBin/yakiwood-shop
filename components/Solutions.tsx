'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import { PageCover } from '@/components/shared/PageLayout';
import { assets } from '@/lib/assets';
const { fence: imgFence, facades: imgFacades, terrace: imgTerrace, interior: imgInterior } = assets.categories;

type SolutionItem = {
  title: string;
  image: string;
  description: string;
};

const solutions: SolutionItem[] = [
  { 
    title: 'Fence', 
    image: imgFence,
    description: 'Private, elegant, and built to last – charred wood fencing that withstands every season while making a statement.'
  },
  { 
    title: 'Facade', 
    image: imgFacades,
    description: 'Turn any building into a landmark with burnt wood cladding that combines striking aesthetics with long-term protection against the elements.'
  },
  { 
    title: 'Terrace', 
    image: imgTerrace,
    description: 'Outdoor spaces designed to endure. Our fire-treated decking offers natural texture, slip resistance, and unmatched longevity.'
  },
  { 
    title: 'Interior', 
    image: imgInterior,
    description: 'Bring depth, warmth, and texture indoors with premium Shou Sugi Ban wall panels that elevate modern interiors.'
  },
];

export default function Solutions() {
  const [openIndex, setOpenIndex] = useState<number>(1); // Facades open by default

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page Header */}
      {/* Removed duplicated header blocks as requested */}
      
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7698 ===== */}
      <div className="lg:hidden">
        {/* Cards - Mobile: Full width accordion style like Figma 759:7702 */}
        <div className="w-full flex flex-col">
          {/* Top border */}
          <div className="h-[1px] bg-[#BBBBBB] w-full" />
          
          {solutions.map((solution, idx) => (
            <div key={idx}>
              {/* Card */}
              <div 
                className={`w-full p-[16px] md:p-[24px] flex flex-col gap-[16px] cursor-pointer transition-colors ${openIndex === idx ? 'bg-[#161616]' : 'bg-[#e1e1e1]'}`}
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              >
                {/* Title */}
                <p className={`font-['DM_Sans'] font-normal text-[20px] md:text-[24px] leading-[1.1] tracking-[-0.96px] max-w-[600px] ${openIndex === idx ? 'text-white' : 'text-[#161616]'}`}>
                  {solution.title}
                </p>
                
                {/* Image - responsive height */}
                <div className={`w-full rounded-[8px] relative overflow-hidden transition-all ${openIndex === idx ? 'h-[160px] md:h-[220px]' : 'h-[56px] md:h-[80px]'}`}>
                  <Image src={solution.image} alt={solution.title} fill className="object-cover" />
                </div>
                
                {/* Description + Learn More - only when open */}
                {openIndex === idx && (
                  <div className="flex flex-col gap-[24px] w-full">
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                      {solution.description}
                    </p>
                    <div className="flex gap-[8px] items-center h-[24px]">
                      <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                        FIND OUT MORE
                      </p>
                      <ArrowRight color="#FFFFFF" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Divider between cards */}
              {idx < solutions.length - 1 && openIndex !== idx && openIndex !== idx + 1 && (
                <div className="h-[1px] bg-[#BBBBBB] mx-[16px]" />
              )}
            </div>
          ))}
          
          {/* Bottom border */}
          <div className="h-[1px] bg-[#BBBBBB] w-full" />
        </div>

        {/* GET AN OFFER Button - Mobile: Figma 759:7710 */}
        <div className="px-[16px] py-[48px]">
          <button className="w-[358px] max-w-full mx-auto block bg-[#161616] rounded-[100px] h-[48px] flex items-center justify-center">
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              Get an offer
            </span>
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+24px)] */}
        <div className="max-w-[1440px] mx-auto px-[40px] pt-[120px] pb-[40px]">
          <div className="relative h-[160px] text-[#161616]">
            <p className="absolute left-0 top-[25px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase">
              purpose
            </p>
            <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] w-[713px]">
              <span>Versatile </span>
              <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">solutions</span>
              <span> for every project</span>
            </p>
          </div>
        </div>
        
        {/* Desktop Cards (Accordion) */}
        <div className="w-full flex flex-col items-center">
          {/* Top divider line */}
          <div className="w-full flex justify-center">
            <div className="w-[1360px] h-px bg-[#BBBBBB]" />
          </div>

          {solutions.map((solution, idx) => {
            const isOpen = openIndex === idx;

            return (
              <React.Fragment key={solution.title}>
                <button
                  type="button"
                  className={`${isOpen ? 'bg-[#161616]' : 'bg-[#e1e1e1]'} w-full text-left`}
                  aria-expanded={isOpen}
                  aria-controls={`solutions-accordion-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                >
                  <div
                    id={`solutions-accordion-panel-${idx}`}
                    className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start"
                  >
                    <div className="w-[328px] shrink-0">
                      <p
                        className={`font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] whitespace-pre-wrap ${isOpen ? 'text-white' : 'text-[#161616]'}`}
                      >
                        {solution.title}
                      </p>
                    </div>

                    <div
                      className={`w-[672px] relative overflow-hidden ${isOpen ? 'h-[300px] rounded-[8px]' : 'h-[100px] rounded-tl-[8px] rounded-tr-[8px]'}`}
                    >
                      <Image src={solution.image} alt={solution.title} fill className="object-cover" />
                    </div>

                    {isOpen && (
                      <div className="w-[288px] h-[300px] flex flex-col items-start justify-between shrink-0">
                        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white whitespace-pre-wrap">
                          {solution.description}
                        </p>
                        <div className="flex gap-[16px] items-center">
                          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">FIND OUT MORE</p>
                          <ArrowRight color="#FFFFFF" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Divider line between cards */}
                <div className="w-full flex justify-center">
                  <div className="w-[1360px] h-px bg-[#BBBBBB]" />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
