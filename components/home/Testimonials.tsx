"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

// Local texture assets for testimonial cards
const activeTexture = "/assets/hero/product-image.png";
const mutedTexture = "/assets/hero/product-image.png";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [activeIndex, setActiveIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials: Testimonial[] = [
    {
      quote: t("testimonial1.quote"),
      author: t("testimonial1.author"),
      role: t("testimonial1.role"),
    },
    {
      quote: t("testimonial2.quote"),
      author: t("testimonial2.author"),
      role: t("testimonial2.role"),
    },
    {
      quote: t("testimonial3.quote"),
      author: t("testimonial3.author"),
      role: t("testimonial3.role"),
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const heading = (
    <>
      What our <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px] text-[#161616]">clients</span> say
    </>
  );

  return (
    <section id="testimonials" className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7576 ===== */}
      <div className="lg:hidden py-[64px]">
        {/* Title Section - Mobile */}
        <div className="px-[16px] mb-[24px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            TESTIMONIALS
          </p>
          <h2 className="font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616]">
            What our <span className="font-['Tiro_Tamil'] italic">clients</span> say
          </h2>
        </div>

        {/* Horizontal scroll cards - Mobile: 450px height, 303px width */}
        <div 
          ref={scrollRef}
          className="flex gap-[16px] overflow-x-auto scrollbar-hide px-[16px] pb-[8px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.author}
              className="relative flex-shrink-0 w-[303px] h-[450px] rounded-[16px] overflow-hidden"
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
          <div className="flex items-start justify-between gap-[24px]">
            {/* Eyebrow and Title */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] leading-[1.2]">TESTIMONIALS</p>
              <h2 className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616]">{heading}</h2>
            </div>
            {/* Navigation buttons */}
            <div className="flex items-center gap-[16px]">
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
