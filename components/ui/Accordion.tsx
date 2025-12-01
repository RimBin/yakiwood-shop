'use client';

import { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

export default function Accordion({ items, defaultOpen = 0 }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full">
      {items.map((item, index) => (
        <div key={index} className="border-t border-[#BBBBBB]">
          <button
            onClick={() => toggleItem(index)}
            className="flex items-center justify-between w-full text-left py-[16px]"
          >
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
              {item.title}
            </p>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              {openIndex === index ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10H16" stroke="#161616" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4V16M4 10H16" stroke="#161616" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-[500px] pb-[16px]' : 'max-h-0'}`}>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] tracking-[0.14px] text-[#535353] pr-[24px]">
              {item.content}
            </p>
          </div>
        </div>
      ))}
      {/* Bottom border */}
      <div className="border-t border-[#BBBBBB]" />
    </div>
  );
}
