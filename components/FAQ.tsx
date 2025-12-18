'use client';

import React, { useState } from 'react';
import Plus from '@/components/icons/Plus';
import Minus from '@/components/icons/Minus';
import { PageCover } from '@/components/shared/PageLayout';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      number: '01',
      question: 'What is Shou Sugi Ban?',
      answer: 'Shou Sugi Ban is an ancient Japanese technique that involves charring wood to protect and enhance its natural beauty. This traditional method originated as a way to make wood more resistant to the elements, including insects, fire, and weathering. The process creates a stunning aesthetic, offering a combination of deep black hues, unique textures, and an elegant, rustic appearance that appeals to architects and homeowners alike.'
    },
    {
      number: '02',
      question: 'How Do I Maintain Shou Sugi Ban Wood?',
      answer: 'Maintenance details here...'
    },
    {
      number: '03',
      question: 'Where can charred wood products be used?',
      answer: 'Usage details here...'
    },
    {
      number: '04',
      question: 'How is Shou Sugi Ban installed?',
      answer: 'Installation details here...'
    },
    {
      number: '05',
      question: 'Is Shou Sugi Ban suitable for interior use?',
      answer: 'Interior usage details here...'
    },
    {
      number: '06',
      question: 'Is Yakisugi suitable for all climates?',
      answer: 'Climate details here...'
    },
    {
      number: '07',
      question: 'What are the standard dimensions for Shou Sugi Ban planks?',
      answer: 'Dimensions details here...'
    }
  ];

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* Page Header */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          FAQ
        </h1>
      </PageCover>
      
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7586 ===== */}
      <div className="lg:hidden py-[64px]">
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
                      {faq.question}
                    </p>
                  </div>
                  {openIndex === idx && (
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white mt-[8px] pl-[40px]">
                      {faq.answer}
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
      <div className="hidden lg:block">
        <div className="max-w-[1440px] mx-auto relative">
        </div>

        {/* Accordion - Full width with centered content */}
        <div className="w-full flex flex-col items-center gap-px">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`w-full ${openIndex === idx ? 'bg-[#161616] min-h-[173px]' : 'bg-[#e1e1e1] h-[70px]'} py-[24px] cursor-pointer`}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <div className="max-w-[1440px] mx-auto px-[40px] w-full">
                <div className="grid grid-cols-[328px_1fr_20px] gap-[16px] items-start w-full">
                  <p className={`font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase whitespace-pre-wrap ${openIndex === idx ? 'text-[#bbbbbb]' : 'text-[#535353]'}`}>{faq.number}</p>
                  <div className="flex flex-col gap-[8px]">
                    <p className={`font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] ${openIndex === idx ? 'text-white' : 'text-[#161616]'}`}>{faq.question}</p>
                    {openIndex === idx && (
                      <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white w-[668px] whitespace-pre-wrap">{faq.answer}</p>
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
