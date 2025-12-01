'use client';

import Image from 'next/image';
import Link from 'next/link';

const backgroundImage = "https://www.figma.com/api/mcp/asset/00b59797-f1e7-446b-b47b-ac24b180d955";

export default function CTA() {
  return (
    <section className="relative w-full overflow-hidden bg-[#E1E1E1]">
      {/* Background Image with opacity and luminosity blend */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-luminosity">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7625 ===== */}
      <div className="lg:hidden relative z-10 flex flex-col items-center justify-center py-[80px] px-[16px]">
        {/* Heading - Mobile */}
        <h2 className="font-['DM_Sans'] font-light text-[45px] leading-[45px] tracking-[-1.8px] text-[#161616] text-center max-w-[358px] mb-[32px]">
          <span>Ready to </span>
          <span className="font-['Tiro_Tamil'] italic">build </span>
          <span>with fire?</span>
        </h2>

        {/* Buttons - Mobile: Stacked */}
        <div className="flex flex-col gap-[16px] w-full max-w-[358px]">
          {/* Primary Button - GET AN OFFER */}
          <Link
            href="/kontaktai"
            className="bg-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              get an offer
            </span>
          </Link>

          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href="/kontaktai"
            className="border border-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              get in touch
            </span>
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:flex relative z-10 flex-col items-center justify-center min-h-[600px] py-[120px] px-[40px]">
        {/* Heading - Desktop */}
        <h2 className="font-['DM_Sans'] font-light text-[72px] leading-[1.1] tracking-[-2.88px] text-[#161616] text-center mb-[48px]">
          <span>Ready to </span>
          <span className="font-['Tiro_Tamil'] italic">build </span>
          <span>with fire?</span>
        </h2>

        {/* Action Buttons - Desktop: Side by Side */}
        <div className="flex gap-[16px] items-center justify-center">
          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href="/kontaktai"
            className="border border-[#161616] flex items-center justify-center h-[56px] px-[48px] py-[12px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[14px] leading-[1.2] tracking-[0.7px] uppercase text-[#161616]">
              GET IN TOUCH
            </span>
          </Link>

          {/* Primary Button - CHOOSE WOOD */}
          <Link
            href="/produktai"
            className="bg-[#161616] flex items-center justify-center h-[56px] px-[48px] py-[12px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[14px] leading-[1.2] tracking-[0.7px] uppercase text-white">
              CHOOSE WOOD
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
