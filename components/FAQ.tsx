'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Plus from '@/components/icons/Plus';
import Minus from '@/components/icons/Minus';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const t = useTranslations('home.faq');

  const faqs = [
    { number: '01', key: '01' },
    { number: '02', key: '02' },
    { number: '03', key: '03' },
    { number: '04', key: '04' },
    { number: '05', key: '05' },
    { number: '06', key: '06' },
    { number: '07', key: '07' },
  ] as const;

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Header removed */}
      
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7586 ===== */}
      <div className="xl:hidden py-[64px]">
        {/* Accordion - Mobile */}

        {/* Accordion - Mobile */}
        <div className="flex flex-col">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`w-full ${openIndex === idx ? 'bg-[#161616]' : 'bg-[#E1E1E1]'} py-[16px] px-[16px] cursor-pointer border-t border-[#BBBBBB] last:border-b`}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <div className="flex items-start justify-between gap-[16px]">
                <div className="flex flex-col gap-[8px] flex-1">
                  <div className="flex items-center gap-[16px]">
                    <p className={`font-['DM_Sans'] font-medium text-[12px] leading-[1.1] tracking-[0.36px] uppercase ${openIndex === idx ? 'text-[#BBBBBB]' : 'text-[#535353]'}`}>
                      {faq.number}
                    </p>
                    <p className={`font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] ${openIndex === idx ? 'text-white' : 'text-[#161616]'}`}>
                      {t(`items.${faq.key}.question`)}
                    </p>
                  </div>
                  {openIndex === idx && (
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white mt-[8px] pl-[40px]">
                      {t(`items.${faq.key}.answer`)}
                    </p>
                  )}
                </div>
                <div className="relative w-[16px] h-[16px] flex-shrink-0 mt-[2px]">
                  {openIndex === idx ? (
                    <Minus color="#FFFFFF" />
                  ) : (
                    <Plus color="#161616" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden xl:block">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+24px)] */}
        <div className="max-w-[1440px] mx-auto px-[40px] pt-[120px] pb-[40px]">
          <div className="relative h-[160px] text-[#161616]">
            <p className="absolute left-0 top-[25px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase">
              {t('eyebrow')}
            </p>
            <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] w-[900px]">
              <span>{t('headline.prefix')}</span>
              <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.emphasis')}</span>
              <span>{t('headline.suffix')}</span>
            </p>
          </div>
        </div>

        {/* Accordion - Full width with centered content */}
        <div className="w-full flex flex-col items-center gap-px">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`w-full ${openIndex === idx ? 'bg-[#161616] min-h-[173px]' : 'bg-[#e1e1e1] h-[70px]'} py-[24px] cursor-pointer border-t border-[#BBBBBB] last:border-b`}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <div className="max-w-[1440px] mx-auto px-[40px] w-full">
                <div className="grid grid-cols-[328px_1fr_20px] gap-[16px] items-start w-full">
                  <p className={`font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase whitespace-pre-wrap ${openIndex === idx ? 'text-[#bbbbbb]' : 'text-[#535353]'}`}>{faq.number}</p>
                  <div className="flex flex-col gap-[8px]">
                    <p className={`font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] ${openIndex === idx ? 'text-white' : 'text-[#161616]'}`}>{t(`items.${faq.key}.question`)}</p>
                    {openIndex === idx && (
                      <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white w-[668px] whitespace-pre-wrap">{t(`items.${faq.key}.answer`)}</p>
                    )}
                  </div>
                  <div className="relative w-[20px] h-[20px] overflow-hidden justify-self-end">
                    {openIndex === idx ? (
                      <Minus color="#FFFFFF" />
                    ) : (
                      <Plus color="#161616" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
