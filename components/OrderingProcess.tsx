'use client';

import React from 'react';

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

export default function OrderingProcess() {
  return (
    <section
      className="w-full bg-[#161616] relative overflow-hidden"
      style={{
        ['--process-scale' as React.CSSProperties['--process-scale']]: 'clamp(0.8, 100vw / 1440, 1)',
        height: 'calc(752px * var(--process-scale))',
      }}
    >
      {/* Background */}
      <div className="absolute left-0 top-0 w-full h-full bg-[#161616]" />

      {/* Scaled desktop canvas */}
      <div
        className="absolute left-1/2 top-0 w-[1440px] -translate-x-1/2 origin-top-center"
        style={{ transform: 'scale(var(--process-scale))' }}
      >
        {/* Container */}
        <div className="relative px-[40px] py-[120px]">
        {/* Title Section */}
        <div className="absolute left-[40px] top-[120px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-white mb-[25px]">
            Process
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-white w-[574px] whitespace-pre-wrap">
            <span>Simple & </span>
            <span className="text-white">fast</span>
            <span> </span>
            <span className="font-['Tiro_Tamil'] italic">ordering</span>
            <span> </span>
            <span>process</span>
          </p>
        </div>

        {/* Steps Section - Exact positioning */}
        <div className="absolute left-[40px] top-[345px]">
          {/* Connection line between steps */}
          <div className="absolute left-[62px] top-[24px] w-[1174px] h-0">
            <div className="w-[1174px] h-px bg-[#535353]" />
          </div>

          {/* Step 1 */}
          <div className="absolute left-[0px] top-[0px] flex flex-col gap-[16px] w-[198px]">
            <div className="bg-[#161616] border border-[#535353] border-solid px-[10px] py-[10px] rounded-[100px] w-[48px] h-[48px] flex items-center justify-center">
              <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
                1
              </p>
            </div>
            <div className="flex flex-col gap-[8px] leading-[1.2] w-full whitespace-pre-wrap">
              <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-white w-[117px]">
                Customize Your Order
              </p>
              <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px] text-[#bbbbbb] w-[198px]">
                Choose wood type, color, width, and height to match your needs.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="absolute left-[calc(25%+73px)] top-[0px] flex flex-col gap-[16px] w-[218px]">
            <div className="bg-[#161616] border border-[#535353] border-solid px-[10px] py-[10px] rounded-[100px] w-[48px] h-[48px] flex items-center justify-center">
              <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
                2
              </p>
            </div>
            <div className="flex flex-col gap-[8px] leading-[1.2] w-full whitespace-pre-wrap">
              <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-white w-[138px]">
                Add to Cart & Checkout
              </p>
              <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px] text-[#bbbbbb] w-[157px]">
                Review your selection and proceed with secure payment.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="absolute left-[calc(50%+124px)] top-[0px] flex flex-col gap-[16px]">
            <div className="bg-[#161616] border border-[#535353] border-solid px-[10px] py-[10px] rounded-[100px] w-[48px] h-[48px] flex items-center justify-center">
              <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
                3
              </p>
            </div>
            <div className="flex flex-col gap-[8px] leading-[1.2] w-full whitespace-pre-wrap">
              <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-white w-[106px]">
                Select Delivery
              </p>
              <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px] text-[#bbbbbb] min-w-full w-[min-content]">
                Pick a shipping option that suits you best.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="absolute left-[calc(75%+132px)] top-[0px] flex flex-col gap-[16px]">
            <div className="bg-[#161616] border border-[#535353] border-solid px-[10px] py-[10px] rounded-[100px] w-[48px] h-[48px] flex items-center justify-center">
              <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
                4
              </p>
            </div>
            <div className="flex flex-col gap-[8px] leading-[1.2] w-full whitespace-pre-wrap">
              <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-white w-[102px]">
                Receive Your Order
              </p>
              <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px] text-[#bbbbbb] w-[134px]">
                We pack and ship your wood safely to your doorstep.
              </p>
            </div>
          </div>
        </div>

          {/* CTA Button - Exact positioning */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[584px] bg-white px-[40px] py-[10px] h-[48px] rounded-[100px] w-[1360px] flex items-center justify-center gap-[10px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              make order
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
