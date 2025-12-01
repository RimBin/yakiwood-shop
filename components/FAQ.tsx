'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Exact Figma assets from FAQ node 790:6618
const imgMinus = "https://www.figma.com/api/mcp/asset/533e8916-1588-4ead-8a6a-bd2f1710b09a";
const imgPlusH = "https://www.figma.com/api/mcp/asset/71354bf3-680c-4298-836c-fc5e8b15d21a";
const imgPlusV = "https://www.figma.com/api/mcp/asset/e0bd269a-1236-4400-b9b3-b45885405484";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      number: '01',
      question: 'What is Shou Sugi Ban?',
      answer:
        'Shou Sugi Ban is an ancient Japanese technique that involves charring wood to protect and enhance its natural beauty. This traditional method originated as a way to make wood more resistant to the elements, including insects, fire, and weathering. The process creates a stunning aesthetic, offering a combination of deep black hues, unique textures, and an elegant, rustic appearance that appeals to architects and homeowners alike.',
    },
    {
      number: '02',
      question: 'How Do I Maintain Shou Sugi Ban Wood?',
      answer: 'Maintenance details here...',
    },
    {
      number: '03',
      question: 'Where can charred wood products be used?',
      answer: 'Usage details here...',
    },
    {
      number: '04',
      question: 'How is Shou Sugi Ban installed?',
      answer: 'Installation details here...',
    },
    {
      number: '05',
      question: 'Is Shou Sugi Ban suitable for interior use?',
      answer: 'Interior usage details here...',
    },
    {
      number: '06',
      question: 'Is Yakisugi suitable for all climates?',
      answer: 'Climate details here...',
    },
    {
      number: '07',
      question: 'What are the standard dimensions for Shou Sugi Ban planks?',
      answer: 'Dimensions details here...',
    },
  ];

  return (
    <section className="w-full bg-[var(--Background-Grey,#E1E1E1)]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[48px]">
        <div className="flex flex-col gap-[16px] text-[#161616]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase whitespace-nowrap">
            faq
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] max-w-[760px] whitespace-pre-wrap">
            <span>Everything you wanted </span>
            <span className="font-['Tiro_Tamil'] italic">to ask</span>
            <span> & more</span>
          </p>
        </div>

        <div className="flex flex-col divide-y divide-[#161616] border-y border-[#161616]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <button
                key={faq.number}
                className={`w-full text-left py-[24px] transition-colors ${
                  isOpen ? 'bg-[#161616]' : 'bg-[#e1e1e1]'
                }`}
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              >
                <div className="max-w-[1440px] mx-auto px-[40px] w-full">
                  <div className="grid grid-cols-[120px_minmax(0,1fr)_24px] gap-[16px] items-start w-full">
                    <p
                      className={`font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase ${
                        isOpen ? 'text-[#bbbbbb]' : 'text-[#535353]'
                      }`}
                    >
                      {faq.number}
                    </p>
                    <div className="flex flex-col gap-[8px]">
                      <p
                        className={`font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] ${
                          isOpen ? 'text-white' : 'text-[#161616]'
                        }`}
                      >
                        {faq.question}
                      </p>
                      {isOpen && (
                        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white max-w-[668px] whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                    <div className="relative w-[24px] h-[24px] overflow-hidden justify-self-end flex items-center justify-center">
                      {isOpen ? (
                        <Image src={imgMinus} alt="" width={20} height={20} />
                      ) : (
                        <div className="relative w-[20px] h-[20px]">
                          <Image src={imgPlusH} alt="" width={20} height={20} className="absolute" />
                          <Image src={imgPlusV} alt="" width={20} height={20} className="absolute" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
