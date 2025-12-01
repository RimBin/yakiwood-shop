'use client';

import React from 'react';
import Image from 'next/image';

// FRESH Figma assets from About node 790:6647
const imgImg = "https://www.figma.com/api/mcp/asset/b62236b8-2ba2-46b7-9843-fda51c75cc81";
const imgImg1 = "https://www.figma.com/api/mcp/asset/c5321f06-89fb-4c39-b224-8efc4ca8944f";
const imgImg2 = "https://www.figma.com/api/mcp/asset/f2c293da-4d5e-47bd-a8ff-cbe1b29d5aad";
const imgImg3 = "https://www.figma.com/api/mcp/asset/bc162298-20cc-4788-aee4-efdeeae6de20";
const imgImg4 = "https://www.figma.com/api/mcp/asset/506f0371-2818-4acd-88a4-bbee4189e731";
const imgImg5 = "https://www.figma.com/api/mcp/asset/81109d88-1e1a-4a0f-9202-50b16c40d658";
const imgImg6 = "https://www.figma.com/api/mcp/asset/24c5ca67-94b5-425f-8b7a-bac267e15c37";
const imgImg7 = "https://www.figma.com/api/mcp/asset/8ef370b3-b692-4420-bd35-2340b9c4334f";
const imgImg8 = "https://www.figma.com/api/mcp/asset/c7f52096-35ce-42b1-9cf6-8d941852e65c";
// Button arrow icon (black) from Figma button component
const imgArrow = "https://www.figma.com/api/mcp/asset/5fc9c418-8f06-4194-a435-59d3b06d4c5f";

export default function About() {
  return (
    <section className="w-full bg-[var(--Background-Grey,#E1E1E1)]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[72px]">
        <div className="flex flex-col gap-[16px] text-[#161616]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase whitespace-nowrap">
            about us
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] max-w-[850px] whitespace-pre-wrap">
            <span>Our story: crafting </span>
            <span className="font-['Tiro_Tamil'] italic">quality </span>
            <span>with </span>
            <span className="font-['Tiro_Tamil'] italic">passion</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[175px_minmax(0,1fr)_308px] gap-[24px] items-start">
          <div className="w-[175px] h-[175px] rounded-[8px] overflow-hidden">
            <Image src={imgImg7} alt="Workshop detail" fill className="object-cover" />
          </div>

          <div className="relative">
            <div className="h-[623px] w-full rounded-[8px] relative overflow-hidden">
              <Image src={imgImg8} alt="Workshop video preview" fill className="object-cover" />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.2)] flex items-center justify-center w-[100px] h-[100px] rounded-full">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                Watch
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[40px] max-w-[308px]">
            <div className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] whitespace-pre-wrap">
              <p className="mb-[10px]">
                We honor the ancient Japanese art of Shou Sugi Ban, transforming wood with fire to create beautiful,
                durable, and sustainable products. Our expertise combines tradition with innovation, delivering high-quality
                wood planks that enhance and protect any space.
              </p>
              <p>
                We aim to inspire and welcome everyone who shares our passion for craftsmanship, sustainability, and
                innovation. Our commitment to these values is reflected in every step of our process, ensuring we deliver
                products that resonate with quality, tradition, and respect for the environment.
              </p>
            </div>
            <button className="flex gap-[8px] items-center px-0 py-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                Read about us
              </p>
              <div className="relative w-[24px] h-[24px] flex items-center justify-center">
                <Image src={imgArrow} alt="" width={16} height={16} />
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[24px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-center text-[#161616]">
            Our partners
          </p>
          <div className="flex flex-wrap justify-center gap-[16px]">
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center p-[10px]">
              <div className="h-[28.75px] w-[92px] relative">
                <Image src={imgImg} alt="Partner" fill className="object-cover" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[215px] flex items-center justify-center p-[10px]">
              <div className="h-[32.5px] w-[104px] relative">
                <Image src={imgImg1} alt="Partner" fill className="object-contain" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center p-[10px]">
              <div className="h-[46.207px] w-[109px] relative">
                <Image src={imgImg2} alt="Partner" fill className="object-contain" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[214px] flex items-center justify-center p-[10px]">
              <div className="h-[36px] w-[92px] relative">
                <Image src={imgImg3} alt="Partner" fill className="object-contain" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center p-[10px]">
              <div className="h-[37.5px] w-[120px] relative">
                <Image src={imgImg4} alt="Partner" fill className="object-contain" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[215px] flex items-center justify-center p-[10px]">
              <div className="h-[28.75px] w-[92px] relative">
                <Image src={imgImg5} alt="Partner" fill className="object-contain" />
              </div>
            </div>
            <div className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center p-[10px]">
              <div className="h-[28.75px] w-[92px] relative">
                <Image src={imgImg6} alt="Partner" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
