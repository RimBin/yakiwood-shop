"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { getSectionSpacing, getContainerPadding } from '@/lib/design-system';
import { assets } from '@/lib/assets';
import InView from '@/components/InView';
import ArrowRight from '@/components/icons/ArrowRight';

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

  const headingText = t('antraste');
  const renderHeading = () => {
    const italicWord = headingText.includes('clients') ? 'clients' : headingText.includes('klientai') ? 'klientai' : null;
    if (!italicWord) return headingText;

    const [before, after] = headingText.split(italicWord);
    return (
      <>
        <span>{before}</span>
        <span className="font-['Tiro_Tamil'] italic tracking-[-1.6px]">{italicWord}</span>
        <span>{after}</span>
      </>
    );
  };

  // Ensure initial active card matches layout (first on tablet/mobile, middle on desktop)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const applyIndex = (matches: boolean) => setActiveIndex(matches ? 1 : 0);
    applyIndex(media.matches);
    const onChange = (event: MediaQueryListEvent) => applyIndex(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Scroll the mobile container to the active item when activeIndex changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const child = container.children[activeIndex] as HTMLElement | undefined;
    if (!child) return;
    // center the child inside the container
    const offset = child.offsetLeft - (container.clientWidth - child.clientWidth) / 2;
    container.scrollTo({ left: offset, behavior: 'smooth' });
  }, [activeIndex]);

  return (
    <section id="testimonials" className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7576 ===== */}
      <InView className="xl:hidden pt-[64px] md:pt-[80px] lg:pt-[120px] pb-0 hero-animate-root">
        {/* Title Section - Mobile/Tablet */}
        <div className={`${getContainerPadding()} mb-[24px] md:mb-[32px] hero-seq-item hero-seq-right`} style={{ animationDelay: '0ms' }}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            {t('eyebrow')}
          </p>
          <h2 className="font-['DM_Sans'] font-light leading-none text-[#161616] max-w-[520px]" style={{ fontSize: 'clamp(34px, 6vw, 44px)', letterSpacing: 'clamp(-1.6px, -0.04em, -1.76px)' }}>
            {renderHeading()}
          </h2>
        </div>

        {/* Horizontal scroll cards - Responsive */}
        <div 
          ref={scrollRef}
          onScroll={() => {
            // debounce active index update while user is scrolling/swiping
            const ref = (scrollRef as any) as { current: HTMLDivElement | null; _scrollTimer?: number };
            if (ref._scrollTimer) window.clearTimeout(ref._scrollTimer);
            ref._scrollTimer = window.setTimeout(() => {
              const container = scrollRef.current;
              if (!container) return;
              const children = Array.from(container.children) as HTMLElement[];
              const center = container.scrollLeft + container.clientWidth / 2;
              let nearest = 0;
              let minDist = Infinity;
              children.forEach((c, i) => {
                const cCenter = c.offsetLeft + c.clientWidth / 2;
                const dist = Math.abs(cCenter - center);
                if (dist < minDist) {
                  minDist = dist;
                  nearest = i;
                }
              });
              setActiveIndex(nearest);
            }, 120);
          }}
          className={`${getContainerPadding()} flex gap-[16px] overflow-x-auto scrollbar-hide pb-[8px] snap-x snap-mandatory scroll-smooth`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={testimonial.author}
                className="relative flex-shrink-0 w-full md:w-[520px] h-[450px] md:h-[480px] rounded-[8px] overflow-hidden snap-center hero-seq-item hero-seq-right"
                style={{ animationDelay: `${220 + index * 160}ms` }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={activeTexture}
                    alt=""
                    fill
                    className={`object-cover ${isActive ? "opacity-100" : "opacity-15 mix-blend-luminosity"}`}
                  />
                  <div className={`absolute inset-0 ${isActive ? "bg-[#3d3d3d]/90" : "bg-[#E1E1E1]"}`} />
                </div>
                <div className={`relative z-10 flex flex-col justify-between h-full p-[24px] ${isActive ? "text-white" : "text-[#b8b8b8]"}`}>
                  <p className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-0.04em]">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <p className={`font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px] ${isActive ? "text-white" : "text-[#9b9b9b]"}`}>
                    &mdash; {testimonial.author}, {testimonial.role}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Navigation Arrows - Mobile */}
        <div className="flex items-center justify-center gap-[12px] mt-[24px] px-[16px] hero-seq-item hero-seq-right" style={{ animationDelay: '760ms' }}>
          <button
            onClick={handlePrev}
            className="w-[56px] h-[36px] px-[14px] rounded-full border border-[#161616] flex items-center justify-center bg-transparent"
            aria-label={t('aria.previous')}
          >
            <ArrowRight color="#161616" className="w-[20px] h-[16px] rotate-180" />
          </button>
          <button
            onClick={handleNext}
            className="w-[56px] h-[36px] px-[14px] rounded-full bg-[#161616] flex items-center justify-center"
            aria-label={t('aria.next')}
          >
            <ArrowRight color="#FFFFFF" className="w-[20px] h-[16px]" />
          </button>
        </div>
      </InView>

      {/* keep mobile arrows in sync by scrolling container when activeIndex changes */}
      {
        /* effect to scroll selected card into view when activeIndex changes (used by arrow buttons) */
      }
      

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <InView className="hidden xl:block max-w-[1440px] mx-auto px-[40px] py-[120px] hero-animate-root">
        <div className="flex flex-col gap-[48px]">
          {/* Title Row - Figma pattern: eyebrow at left-[40px], heading at left-[calc(25%+25px)] */}
          <div className="relative h-[80px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            {/* Eyebrow */}
            <p className="absolute left-0 top-[25px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] leading-[1.2]">
              {t('eyebrow')}
            </p>
            {/* Main Heading */}
            <p className="absolute left-[calc(25%+25px)] right-[120px] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] whitespace-nowrap">
              {renderHeading()}
            </p>
            {/* Navigation buttons - positioned at far right */}
            <div className="absolute right-0 top-[20px] flex items-center gap-[12px]">
              <button
                onClick={handlePrev}
                className="w-[56px] h-[36px] px-[14px] rounded-full border border-[#161616] flex items-center justify-center bg-transparent hover:bg-[#161616]/5 transition-colors"
                aria-label={t('aria.previous')}
              >
                <ArrowRight color="#161616" className="w-[20px] h-[16px] rotate-180" />
              </button>
              <button
                onClick={handleNext}
                className="w-[56px] h-[36px] px-[14px] rounded-full bg-[#161616] flex items-center justify-center hover:bg-[#0c0c0c] transition-colors"
                aria-label={t('aria.next')}
              >
                <ArrowRight color="#FFFFFF" className="w-[20px] h-[16px]" />
              </button>
            </div>
          </div>

          <div className="flex items-start justify-center gap-[24px] overflow-visible">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={testimonial.author}
                  className={`relative overflow-hidden flex flex-col justify-between transition-all duration-500 hero-seq-item hero-seq-right ${
                    isActive ? "w-[680px] rounded-[8px]" : "w-[520px] rounded-[8px]"
                  } h-[460px]`}
                  style={{ animationDelay: `${220 + index * 160}ms` }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={isActive ? activeTexture : mutedTexture}
                      alt=""
                      fill
                      className={`object-cover ${
                        isActive ? "opacity-100" : "opacity-15 mix-blend-luminosity"
                      }`}
                      priority={isActive}
                    />
                    <div
                      className={`absolute inset-0 ${
                        isActive ? "bg-[#161616]/90" : "bg-[#E1E1E1]"
                      }`}
                    />
                  </div>

                  <div
                    className={`relative z-10 flex h-full flex-col justify-between p-[32px] ${
                      isActive ? "text-white" : "text-[#b8b8b8]"
                    }`}
                  >
                    <p className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-0.04em]">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <p
                      className={`font-['DM_Sans'] font-medium text-[14px] tracking-[-0.14px] ${
                        isActive ? "text-white" : "text-[#9b9b9b]"
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
      </InView>
    </section>
  );
}
