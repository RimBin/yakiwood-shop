'use client';

import React from 'react';
import Image from 'next/image';

// Figma assets (fresh) from Why us node 790:6793
// Shared vector background + specific foreground icon per benefit
const iconVector = "https://www.figma.com/api/mcp/asset/69d8baf5-1e9c-497f-ba63-ad3b64851e16"; // background arc/vector
const iconFire = "https://www.figma.com/api/mcp/asset/95323e41-66a3-4601-a529-9a85e11b37f0"; // fire
const iconWarehouse = "https://www.figma.com/api/mcp/asset/126276fc-6d99-44f0-8170-6a2a866daa4e"; // warehouse
const iconLeaf = "https://www.figma.com/api/mcp/asset/d9b34eb8-8038-4a58-914d-d17e113245d4"; // leaf
const iconCube = "https://www.figma.com/api/mcp/asset/21774430-e2b6-4c60-a618-4f58ee5d3f7e"; // cube

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
    <section className="w-full bg-[var(--Background-Grey,#E1E1E1)]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[56px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">
            yakiwood
          </p>

          <div className="grid gap-[32px] lg:grid-cols-[minmax(0,1fr)_340px] items-start">
            <p className="font-['DM_Sans'] font-light text-[52px] leading-none tracking-[-2.08px] text-[#161616]">
              We are experts in the preparation of{' '}
              <span className="font-['Tiro_Tamil'] italic">burnt wood</span>, with many years of{' '}
              <span className="font-['Tiro_Tamil'] italic">successful</span> experience in preparing wood for facades,
              terraces, fences and interiors, and we guarantee a{' '}
              <span className="font-['Tiro_Tamil'] italic">high quality</span> and long-lasting{' '}
              <span className="font-['Tiro_Tamil'] italic">result</span>.
            </p>

            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
              Our aim is to help you create a cosy and sustainable environment using a natural, time-tested woodworking
              method. We produce wood prepared according to the unique, time-tested Japanese wood-burning technology
              "Yakisugi" (or "Shou Sugi Ban"). This is the most natural way of preparing wood, giving it both a
              protective and aesthetic function.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[16px]">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-[#eaeaea] rounded-[8px] p-[16px] flex flex-col gap-[24px] items-start min-h-[208px]"
            >
              <div className="border-[#bbbbbb] border-[0.5px] border-solid rounded-[100px] w-[48px] h-[48px] relative overflow-hidden">
                <div className="absolute top-0 left-[25%] right-[25%] bottom-1/2">
                  <Image src={iconVector} alt="decorative arc" fill className="object-contain" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px]">
                  <Image src={benefit.primary} alt={benefit.alt} width={24} height={24} />
                </div>
              </div>

              <div className="flex flex-col gap-[8px] items-start w-full">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {benefit.title}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[257px] whitespace-pre-wrap">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
