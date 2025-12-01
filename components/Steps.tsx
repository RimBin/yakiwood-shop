'use client';

import React from 'react';
import Image from 'next/image';

// Figma asset - Steps divider line
const imgVector37 = "https://www.figma.com/api/mcp/asset/a0dabf49-09ad-4c89-a856-d9241b18e182";

const steps = [
  {
    number: '1',
    title: 'Customize Your Order',
    description: 'Choose wood type, color, width, and height to match your needs.',
  },
  {
    number: '2',
    title: 'Add to Cart & Checkout',
    description: 'Review your selection and proceed with secure payment.',
  },
  {
    number: '3',
    title: 'Select Delivery',
    description: 'Pick a shipping option that suits you best.',
  },
  {
    number: '4',
    title: 'Receive Your Order',
    description: 'We pack and ship your wood safely to your doorstep.',
  },
];

export default function Steps() {
  return (
    <section className="w-full bg-[#161616]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[72px]">
        <div className="flex flex-col gap-[16px] text-white">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase whitespace-nowrap">
            Process
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] max-w-[620px]">
            <span>Simple & fast </span>
            <span className="font-['Tiro_Tamil'] italic">ordering</span>
            <span> process</span>
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[48px] right-[48px] top-[24px] hidden lg:block">
            <Image src={imgVector37} alt="" width={1174} height={1} className="w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[32px] relative">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-[16px] items-start">
                <div className="bg-[#161616] border border-[#535353] border-solid flex items-center justify-center rounded-full w-[48px] h-[48px] shrink-0">
                  <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
                    {step.number}
                  </p>
                </div>
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white whitespace-pre-wrap">
                    {step.title}
                  </p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] whitespace-pre-wrap">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="bg-white flex items-center justify-center px-[40px] py-[10px] rounded-[100px] w-full h-[48px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
            make order
          </p>
        </button>
      </div>
    </section>
  );
}
