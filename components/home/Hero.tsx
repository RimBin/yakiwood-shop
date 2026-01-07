import React from 'react';
import Image from 'next/image';
import { assets } from '@/lib/assets';

const imgProductImage = assets.projects[0];
const mobileColors = assets.colors;
const certifications = [assets.certifications.fsc, assets.certifications.eu, assets.certifications.epd];

export default function Hero() {
  return (
    <section className="w-full bg-[#E1E1E1] relative overflow-hidden">
      {/* ===== MOBILE LAYOUT (< 1024px) ===== */}
      <div className="lg:hidden flex flex-col">
        <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
          <p className="font-['DM_Sans'] font-light text-[45px] leading-none tracking-[-1.8px] text-[#161616] w-[355px] whitespace-pre-wrap">
            {`Timeless beauty, enhanced by fire - `}
            <span className="font-['Tiro_Tamil'] italic">Yakiwood</span>
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] w-[323px]">
            Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.
          </p>
        </div>

        <div className="relative w-full">
          <div className="bg-[#bbab92] w-full h-[423px] relative">
            <div className="absolute left-[8.34px] top-0 w-[367px] h-[309.127px] flex items-center justify-center overflow-hidden">
              <div className="rotate-[333.068deg]">
                <div className="w-[317.433px] h-[185.467px] relative">
                  <Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-4 bottom-[35px] right-4 bg-white/10 backdrop-blur-[20px] border border-white/50 rounded-[16px] p-3 flex flex-col gap-3">
            <div className="flex items-start justify-between w-full">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white">Shou sugi Ban Planks</p>
              <div className="flex gap-1 items-center text-white">
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">From</p>
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">89 €</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">Solutions</p>
              <div className="flex gap-1">
                {['Facades', 'fence', 'terrace', 'interior'].map((label) => (
                  <div key={label} className="bg-white/40 px-2 h-[24px] rounded-[4px] flex items-center justify-center">
                    <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">Colors</p>
              <div className="flex gap-1 items-center">
                {mobileColors.map((src, i) => (
                  <div key={i} className="w-[24px] h-[24px] rounded-[4px] relative overflow-hidden">
                    <Image src={src} alt="" width={20} height={20} className="w-[20px] h-[20px] m-[2px]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white h-[48px] rounded-[100px] flex items-center justify-center w-full">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">Buy now</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#161616] px-4 py-2 flex items-center justify-between">
          {certifications.map((src) => (
            <div key={src} className="h-[28px] w-[56px] relative">
              <Image src={src} alt="" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block relative w-full min-h-[861px]">
        {/* Full-screen wood texture background */}
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src={assets.categories.facades}
            alt="" 
            fill 
            className="object-cover"
            priority
          />
        </div>

        {/* Centered content container */}
        <div className="relative max-w-[1440px] mx-auto h-full">
          <div className="absolute left-[40px] top-[259px] flex flex-col gap-[24px] z-10">
            <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[606px] whitespace-pre-wrap">
              {`Timeless beauty, enhanced by fire - `}
              <span className="font-['Tiro_Tamil'] italic tracking-[-1.6px]">Yakiwood</span>
            </p>

            <div className="flex flex-col gap-[24px] overflow-clip">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] w-[323px] whitespace-pre-wrap">
                {`Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique. `}
              </p>

              <div className="border border-[#161616] border-solid px-[40px] py-[10px] h-[48px] rounded-[100px] flex items-center justify-center gap-[10px] w-fit">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">Explore catalog</p>
              </div>

              <div className="flex gap-[24.39px] items-center">
                {['Mastercard', 'Visa', 'Stripe', 'PayPal'].map((label) => (
                  <span
                    key={label}
                    className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]/70"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute left-[calc(50%+10px)] top-[125px] z-10">
            <div className="bg-[#bbab92] rounded-[24px] w-[670px] h-[654px]" />

            <div className="absolute left-[2px] top-[42.86px] w-[663.054px] h-[558.481px] flex items-center justify-center overflow-hidden">
              <div className="rotate-[333.068deg]">
                <div className="w-[573.487px] h-[335.073px] relative"><Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" /></div>
              </div>
            </div>

            <div className="absolute left-[311px] top-[352px] bg-white/10 backdrop-blur-[20px] border border-white/50 border-solid rounded-[24px] p-[16px] w-[351px] flex flex-col gap-[16px]">
              <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-white w-[292px] whitespace-pre-wrap">Shou sugi Ban Planks</p>

              <div className="flex gap-[8px] items-center text-white">
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">From</p>
                <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px]">89 €</p>
              </div>

              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">Solutions</p>
                <div className="flex gap-[4px]">
                  {['Facades','fence','terrace','interior'].map((label) => (
                    <div key={label} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]"><p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{label}</p></div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white w-full whitespace-pre-wrap">Colors</p>
                <div className="flex gap-0 pl-0 pr-[4px] isolate">
                  {assets.colors.slice(0, 6).map((src,i)=> (
                    <div key={i} className="-mr-[4px] w-[32px] h-[32px] relative" style={{zIndex:6-i}}><Image src={src} alt="" width={33} height={33} /></div>
                  ))}
                </div>
              </div>

              <div className="bg-white px-[40px] py-[10px] h-[48px] rounded-[100px] flex items-center justify-center gap-[10px] w-full">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">Buy now</p>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-[800px] w-[1440px] bg-[#161616] px-[40px] py-[16px] flex gap-[150px] items-center justify-center z-10">
            {certifications.map((src) => (
              <div key={src} className="h-[32px] w-[72px] relative">
                <Image src={src} alt="" fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
