"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import { getSectionSpacing, getContainerPadding } from '@/lib/design-system';
import { assets } from '@/lib/assets';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

// Local texture assets for testimonial cards
const activeTexture = assets.projects[2];
const mutedTexture = assets.projects[2];

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [activeIndex, setActiveIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials: Testimonial[] = [
    {
      quote: t("atsiliepimas1.citata"),
      author: t("atsiliepimas1.autorius"),
      role: t("atsiliepimas1.role"),
    },
    {
      quote: t("atsiliepimas2.citata"),
      author: t("atsiliepimas2.autorius"),
      role: t("atsiliepimas2.role"),
    },
    {
      quote: t("atsiliepimas3.citata"),
      author: t("atsiliepimas3.autorius"),
      role: t("atsiliepimas3.role"),
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const heading = <>{t('antraste')}</>;

  return (
    <section id="testimonials" className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7576 ===== */}
      <div className={`lg:hidden ${getSectionSpacing()}`}>
        {/* Title Section - Mobile/Tablet */}
        <div className={`${getContainerPadding()} mb-[24px] md:mb-[32px]`}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            {t('eyebrow')}
          </p>
          <h2 className="font-['DM_Sans'] font-light leading-none text-[#161616] max-w-[500px]" style={{ fontSize: 'clamp(32px, 5vw, 44px)', letterSpacing: 'clamp(-1.6px, -0.04em, -1.76px)' }}>
            {heading}
          </h2>
        </div>

        {/* Horizontal scroll cards - Responsive */}
        <div 
          ref={scrollRef}
          className="flex gap-[16px] overflow-x-auto scrollbar-hide px-[16px] md:px-[32px] pb-[8px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.author}
              className="relative flex-shrink-0 w-[303px] md:w-[380px] h-[450px] md:h-[480px] rounded-[16px] overflow-hidden"
            >
              <div className="absolute inset-0">
                <Image
                  src={activeTexture}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#3d3d3d]/90" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full p-[24px]">
                <p className="font-['Outfit'] font-light text-[16px] leading-[1.4] tracking-[0.14px] text-white">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px] text-white">
                  &mdash; {testimonial.author}, {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Navigation Arrows - Mobile */}
        <div className="flex items-center justify-center gap-[16px] mt-[24px] px-[16px]">
          <button
            onClick={handlePrev}
            className="w-[40px] h-[40px] rounded-full border border-[#161616] flex items-center justify-center bg-transparent"
            aria-label="Previous testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L9 12L15 18" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-[40px] h-[40px] rounded-full bg-[#161616] flex items-center justify-center"
            aria-label="Next testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] py-[120px]">
        <div className="flex flex-col gap-[48px]">
          {/* Title Row - Figma pattern: eyebrow at left-[40px], heading at left-[calc(25%+25px)] */}
          <div className="relative h-[80px]">
            {/* Eyebrow */}
            <p className="absolute left-0 top-[25px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] leading-[1.2]">
              TESTIMONIALS
            </p>
            {/* Main Heading */}
            <h2 className="absolute left-[calc(25%+25px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[687px]">
              {heading}
            </h2>
            {/* Navigation buttons - positioned at far right */}
            <div className="absolute right-0 top-[20px] flex items-center gap-[16px]">
              <button
                onClick={handlePrev}
                className="w-[40px] h-[40px] rounded-full border border-[#161616] flex items-center justify-center bg-transparent hover:bg-[#161616]/5 transition-colors"
                aria-label="Previous testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6L9 12L15 18" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-[40px] h-[40px] rounded-full bg-[#161616] flex items-center justify-center hover:bg-[#0c0c0c] transition-colors"
                aria-label="Next testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-stretch justify-center gap-[24px] overflow-hidden">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={testimonial.author}
                  className={`relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                    isActive ? "w-[570px] rounded-[24px]" : "w-[380px] rounded-[16px] opacity-40"
                  } min-h-[320px]`}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={isActive ? activeTexture : mutedTexture}
                      alt=""
                      fill
                      className={`object-cover ${
                        isActive ? "opacity-100" : "opacity-20 mix-blend-luminosity"
                      }`}
                      priority={isActive}
                    />
                    <div
                      className={`absolute inset-0 ${
                        isActive ? "bg-[#3d3d3d]/90" : "bg-white/85"
                      }`}
                    />
                  </div>

                  <div
                    className={`relative z-10 flex flex-col gap-[32px] p-[40px] ${
                      isActive ? "text-white" : "text-[#b8b8b8]"
                    }`}
                  >
                    <p className="font-['Outfit'] text-[20px] leading-[1.5] tracking-[0.14px]">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <p
                      className={`font-['DM_Sans'] text-[16px] tracking-[-0.32px] ${
                        isActive ? "text-white" : "text-[#c4c4c4]"
                      }`}
                    >
                      &mdash; {testimonial.author}, {testimonial.role}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
