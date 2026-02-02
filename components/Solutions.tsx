'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ArrowRight from '@/components/icons/ArrowRight';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import { assets } from '@/lib/assets';
import InView from '@/components/InView';
const { fence: imgFence, facades: imgFacades, terrace: imgTerrace, interior: imgInterior } = assets.categories;

type SolutionId = 'terrace' | 'facade' | 'fence' | 'interior';

type SolutionItem = {
  id: SolutionId;
  image: string;
};

const solutions: SolutionItem[] = [
  { id: 'terrace', image: imgTerrace },
  { id: 'facade', image: imgFacades },
  { id: 'fence', image: imgFence },
  { id: 'interior', image: imgInterior },
];

export default function Solutions() {
  const [openIndex, setOpenIndex] = useState<number>(0); // Terrace open by default
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const t = useTranslations('home.solutions');

  const anchorMap: Record<SolutionId, string> = {
    terrace: 'terraces',
    facade: 'facades',
    fence: 'fences',
    interior: 'interior',
  };

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page Header */}
      {/* Removed duplicated header blocks as requested */}
      
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7698 ===== */}
        <InView className="lg:hidden hero-animate-root">
        {/* Cards - Mobile: Full width accordion style like Figma 759:7702 */}
        <div className="w-full flex flex-col">
          {/* Top border */}
          <div className="h-[1px] bg-[#BBBBBB] w-full" />
          
          {solutions.map((solution, idx) => (
            <div key={idx}>
              {/* Card */}
              <div 
                className={`w-full p-[16px] md:p-[24px] flex flex-col gap-[16px] cursor-pointer transition-colors hero-seq-item hero-seq-right ${openIndex === idx ? 'bg-[#161616]' : 'bg-[#e1e1e1]'}`}
                style={{ animationDelay: `${idx * 180}ms` }}
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              >
                {/* Title */}
                <p className={`font-['DM_Sans'] font-normal text-[20px] md:text-[24px] leading-[1.1] tracking-[-0.96px] max-w-[600px] ${openIndex === idx ? 'text-white' : 'text-[#161616]'}`}>
                  {t(`items.${solution.id}.title`)}
                </p>
                
                {/* Image - responsive height */}
                <div className={`w-full rounded-[8px] relative overflow-hidden transition-all ${openIndex === idx ? 'h-[160px] md:h-[220px]' : 'h-[56px] md:h-[80px]'}`}>
                  <Image src={solution.image} alt={t(`items.${solution.id}.title`)} fill className="object-cover" />
                </div>
                
                {/* Description + Learn More - only when open */}
                {openIndex === idx && (
                  <div className="flex flex-col gap-[24px] w-full">
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                      {t(`items.${solution.id}.description`)}
                    </p>
                    <div className="flex gap-[8px] items-center h-[24px]">
                      <Link
                        href={toLocalePath(`/solutions#${anchorMap[solution.id]}`, currentLocale)}
                        className="flex items-center gap-[8px]"
                      >
                        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                          {t('cta.learnMore')}
                        </p>
                        <ArrowRight color="#FFFFFF" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Divider between cards */}
              {idx < solutions.length - 1 && openIndex !== idx && openIndex !== idx + 1 && (
                <div className="h-[1px] bg-[#BBBBBB] mx-[16px]" />
              )}
            </div>
          ))}
          
          {/* Bottom border */}
          <div className="h-[1px] bg-[#BBBBBB] w-full" />
        </div>

        {/* GET AN OFFER Button - Mobile: Figma 759:7710 */}
        <div className="px-[16px] py-[48px] hero-seq-item hero-seq-right" style={{ animationDelay: '900ms' }}>
          <Link
            href={toLocalePath('/contact', currentLocale)}
            className="w-[358px] max-w-full mx-auto block bg-[#161616] rounded-[100px] h-[48px] flex items-center justify-center"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              {t('cta.offer')}
            </span>
          </Link>
        </div>
      </InView>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
        <InView className="hidden lg:block hero-animate-root">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+24px)] */}
        <div className="max-w-[1440px] mx-auto px-[40px] pt-[120px] pb-[40px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <div className="relative h-[160px] text-[#161616]">
            <p className="absolute left-0 top-[25px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase">
              {t('eyebrow')}
            </p>
            <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] w-[713px]">
              <span className="inline-flex whitespace-nowrap">
                <span>{t('headline.prefix')}</span>
                <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">&nbsp;{t('headline.emphasis')}</span>
              </span>
              <span className="block">{t('headline.suffix')}</span>
            </p>
          </div>
        </div>
        
        {/* Desktop Cards (Accordion) */}
        <div className="w-full flex flex-col items-center">
          {/* Top divider line */}
          <div className="w-full flex justify-center">
            <div className="w-[1360px] h-px bg-[#BBBBBB]" />
          </div>

          {solutions.map((solution, idx) => {
            const isOpen = openIndex === idx;

            return (
              <React.Fragment key={solution.id}>
                <button
                  type="button"
                  className={`${isOpen ? 'bg-[#161616]' : 'bg-[#e1e1e1]'} w-full text-left hero-seq-item hero-seq-right`}
                  style={{ animationDelay: `${220 + idx * 160}ms` }}
                  aria-expanded={isOpen}
                  aria-controls={`solutions-accordion-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                >
                  <div
                    id={`solutions-accordion-panel-${idx}`}
                    className="max-w-[1440px] mx-auto px-[40px] py-[24px] flex gap-[16px] items-start"
                  >
                    <div className="w-[328px] shrink-0">
                      <p
                        className={`font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] whitespace-pre-wrap ${isOpen ? 'text-white' : 'text-[#161616]'}`}
                      >
                        {t(`items.${solution.id}.title`)}
                      </p>
                    </div>

                    <div
                      className={`w-[672px] relative overflow-hidden ${isOpen ? 'h-[300px] rounded-[8px]' : 'h-[100px] rounded-tl-[8px] rounded-tr-[8px]'}`}
                    >
                      <Image src={solution.image} alt={t(`items.${solution.id}.title`)} fill className="object-cover" />
                    </div>

                    {isOpen && (
                      <div className="w-[288px] h-[300px] flex flex-col items-start justify-between shrink-0">
                        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white whitespace-pre-wrap">
                          {t(`items.${solution.id}.description`)}
                        </p>
                        <div className="flex gap-[16px] items-center">
                          <Link
                            href={toLocalePath(`/solutions#${anchorMap[solution.id]}`, currentLocale)}
                            className="flex items-center gap-[8px]"
                          >
                            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">{t('cta.learnMore')}</p>
                            <ArrowRight color="#FFFFFF" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Divider line between cards */}
                <div className="w-full flex justify-center">
                  <div className="w-[1360px] h-px bg-[#BBBBBB]" />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </InView>
    </section>
  );
}
