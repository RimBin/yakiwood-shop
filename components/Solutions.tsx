'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import { PageCover } from '@/components/shared/PageLayout';

// Local assets
const imgVector33 = "/assets/imgVector33.jpg";
const imgFence = "/assets/imgFence.jpg";
const imgFacades = "/assets/imgFacades.jpg";
const imgTerrace = "/assets/imgTerrace.jpg";
const imgInterior = "/assets/imgInterior.jpg";

type SolutionItem = {
  title: string;
  image: string;
  description: string;
};

const solutions: SolutionItem[] = [
  { 
    title: 'Fence', 
    image: imgFence,
    description: 'Burnt wood creates beautiful, durable fencing solutions that enhance your property with a distinctive aesthetic.'
  },
  { 
    title: 'Facades', 
    image: imgFacades,
    description: 'Burnt wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is wooden facade finishes that give a modern and solid look. This article "Burnt wood for facades: a modern and durable choice" presents the advantages of burnt wood facade finishes and provides recommendations on how to use this technique in your projects.'
  },
  { 
    title: 'Terace', 
    image: imgTerrace,
    description: 'Transform your outdoor space with charred wood terrace solutions that combine beauty with weather resistance.'
  },
  { 
    title: 'Interior', 
    image: imgInterior,
    description: 'Bring the warmth and elegance of Shou Sugi Ban wood into your interior spaces for a unique, natural atmosphere.'
  },
];

export default function Solutions() {
  const [openIndex, setOpenIndex] = useState<number>(1); // Facades open by default

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page Header */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          <span>Versatile </span>
          <span className="font-['Tiro_Tamil'] italic">solutions</span>
          <span> for every project</span>
        </h1>
      </PageCover>
      
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
                        Learn more
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
        {/* Desktop Cards */}
        <div className="w-full flex flex-col items-center gap-px">
        {/* Top divider line */}
        <div className="w-full flex justify-center">
          <div className="h-0 w-[1360px] relative shrink-0">
            <Image src={imgVector33} alt="" width={1360} height={1} />
          </div>
        </div>

        {/* Fence Card */}
        <div className="bg-[#e1e1e1] w-full">
          <div className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start">
          <div className="w-[328px] shrink-0">
            <p className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616] whitespace-pre-wrap">Fence</p>
          </div>
          <div className="w-[672px] h-[100px] rounded-tl-[8px] rounded-tr-[8px] relative overflow-hidden">
            <Image src={imgFence} alt="Fence" fill className="object-cover" />
          </div>
          </div>
        </div>

        {/* Facades Card (featured - full width black) */}
        <div className="bg-[#161616] w-full">
          <div className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start">
          <div className="w-[328px] shrink-0">
            <p className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-white whitespace-pre-wrap">Facades</p>
          </div>
          <div className="w-[672px] h-[300px] rounded-[8px] relative overflow-hidden">
            <Image src={imgFacades} alt="Facades" fill className="object-cover" />
          </div>
          <div className="w-[288px] h-[300px] flex flex-col items-start justify-between shrink-0">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white whitespace-pre-wrap">
              Burnt wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is wooden facade finishes that give a modern and solid look. This article "Burnt wood for facades: a modern and durable choice" presents the advantages of burnt wood facade finishes and provides recommendations on how to use this technique in your projects.
            </p>
            <div className="flex gap-[16px] items-center">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">Learn more</p>
              <ArrowRight color="#FFFFFF" />
            </div>
          </div>
          </div>
        </div>

        {/* Terrace Card */}
        <div className="bg-[#e1e1e1] w-full">
          <div className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start">
          <div className="w-[328px] shrink-0">
            <p className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616] whitespace-pre-wrap">Terrace</p>
          </div>
          <div className="w-[672px] h-[100px] rounded-tl-[8px] rounded-tr-[8px] relative overflow-hidden">
            <Image src={imgTerrace} alt="Terrace" fill className="object-cover" />
          </div>
          </div>
        </div>

        {/* Middle divider line */}
        <div className="w-full flex justify-center">
          <div className="h-0 w-[1360px] relative shrink-0">
            <Image src={imgVector33} alt="" width={1360} height={1} />
          </div>
        </div>

        {/* Interior Card */}
        <div className="bg-[#e1e1e1] w-full">
          <div className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start">
          <div className="w-[328px] shrink-0">
            <p className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616] whitespace-pre-wrap">Interior</p>
          </div>
          <div className="w-[672px] h-[100px] rounded-tl-[8px] rounded-tr-[8px] relative overflow-hidden">
            <Image src={imgInterior} alt="Interior" fill className="object-cover" />
          </div>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="w-full flex justify-center">
          <div className="h-0 w-[1360px] relative shrink-0">
            <Image src={imgVector33} alt="" width={1360} height={1} />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
