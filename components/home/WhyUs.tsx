'use client';

import React from 'react';
import Image from 'next/image';

// Local assets for WhyUs section
const iconVector = "/assets/icons/vector-top.svg";
const iconFire = "/assets/icons/fire.svg";
const iconWarehouse = "/assets/icons/warehouse.svg";
const iconLeaf = "/assets/icons/leaf.svg";
const iconCube = "/assets/icons/cube.svg";

export default function WhyUs() {
  const benefits = [
    {
      primary: iconFire,
      title: 'Beautiful natural aesthetics',
      description: 'Fire-treated for superior resistance to moisture, pests, and decay.',
      alt: 'Flame icon'
    },
    {
      primary: iconWarehouse,
      title: 'Striking Look',
      description: 'Deep texture and rich tones enhance any design.',
      alt: 'Warehouse icon'
    },
    {
      primary: iconLeaf,
      title: 'Eco-friendly',
      description: 'Sustainably sourced with no harmful chemicals.',
      alt: 'Leaf icon'
    },
    {
      primary: iconCube,
      title: 'Versatile for any project',
      description: 'Perfect for cladding, decking, and interiors.',
      alt: 'Cube icon'
    }
  ];

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7566 ===== */}
      <div className="lg:hidden px-[16px] py-[64px]">
        {/* Title Section - Mobile */}
        <div className="flex flex-col gap-[8px] mb-[16px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            yakiwood
          </p>
          <p className="font-['DM_Sans'] font-light text-[32px] leading-none tracking-[-1.28px] text-[#161616] w-[358px]">
            <span>We are experts in the preparation of </span>
            <span className="font-['Tiro_Tamil'] italic">burnt wood</span>
            <span>, with many years of </span>
            <span className="font-['Tiro_Tamil'] italic">successful</span>
            <span> experience in preparing wood for facades, terraces, fences and interiors, and we guarantee a </span>
            <span className="font-['Tiro_Tamil'] italic">high quality</span>
            <span> and long-lasting </span>
            <span className="font-['Tiro_Tamil'] italic">result.</span>
          </p>
        </div>

        {/* Description - Mobile */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[312px] mb-[24px]">
          Our aim is to help you create a cosy and sustainable environment using a natural, time-tested woodworking method. We produce wood prepared according to the unique, time-tested Japanese wood-burning technology "Yakisugi" (or "Shou Sugi Ban"). This is the most natural way of preparing wood, giving it both a protective and aesthetic function.
        </p>

        {/* Benefits Cards - Mobile: Stacked vertically with gap-[8px] */}
        <div className="flex flex-col gap-[8px]">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-[#eaeaea] rounded-[8px] p-[16px] w-full flex flex-col gap-[16px] items-start">
              {/* Icon */}
              <div className="border-[#bbbbbb] border-[0.5px] border-solid rounded-[100px] w-[48px] h-[48px] relative overflow-hidden">
                <div className="absolute top-0 left-[25%] right-[25%] bottom-1/2">
                  <Image src={iconVector} alt="" fill className="object-contain" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px]">
                  <Image src={benefit.primary} alt={benefit.alt} width={24} height={24} />
                </div>
              </div>
              {/* Text */}
              <div className="flex flex-col gap-[4px] items-start w-full">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {benefit.title}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] relative">
        {/* Label */}
        <p className="absolute font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] left-[40px] top-[18px]">
          yakiwood
        </p>

        {/* Main text */}
        <p className="font-['DM_Sans'] font-light text-[52px] leading-none tracking-[-2.08px] text-[#161616] pt-[0px] w-[1360px]">
          <span>                             We are experts in the preparation of </span>
          <span className="font-['Tiro_Tamil'] italic">burnt wood</span>
          <span>, with many years of </span>
          <span className="font-['Tiro_Tamil'] italic">successful</span>
          <span> experience in preparing wood for facades, terraces, fences and interiors, and we guarantee a </span>
          <span className="font-['Tiro_Tamil'] italic">high quality</span>
          <span> and long-lasting </span>
          <span className="font-['Tiro_Tamil'] italic">result</span>.
        </p>

        {/* Description text */}
        <p className="absolute font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] left-[calc(50%+48px)] top-[256px] w-[312px]">
          Our aim is to help you create a cosy and sustainable environment using a natural, time-tested woodworking method. We produce wood prepared according to the unique, time-tested Japanese wood-burning technology "Yakisugi" (or "Shou Sugi Ban"). This is the most natural way of preparing wood, giving it both a protective and aesthetic function.
        </p>

        {/* Benefits cards */}
        <div className="absolute left-[40px] top-[432px] flex gap-[16px] items-center">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-[#eaeaea] rounded-[8px] p-[16px] w-[328px] flex flex-col gap-[24px] items-start">
              <div className="border-[#bbbbbb] border-[0.5px] border-solid rounded-[100px] w-[48px] h-[48px] relative overflow-hidden">
                <div className="absolute top-0 left-[25%] right-[25%] bottom-1/2">
                  <Image src={iconVector} alt="" fill className="object-contain" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px]">
                  <Image src={benefit.primary} alt={benefit.alt} width={24} height={24} />
                </div>
              </div>
              <div className="flex flex-col gap-[8px] items-start w-full">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {benefit.title}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[257px]">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[611px]" />
      </div>
    </section>
  );
}
