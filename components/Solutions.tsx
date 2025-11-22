"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SolutionItem {
  key: string;
  title: string;
  description: string;
  features: string[];
}

export default function Solutions() {
  const t = useTranslations('solutions');
  const items: SolutionItem[] = [
    { key: 'facades', title: t('facades.title'), description: t('facades.description'), features: t('facades.features').split('|') },
    { key: 'interior', title: t('interior.title'), description: t('interior.description'), features: t('interior.features').split('|') },
    { key: 'outdoor', title: t('outdoor.title'), description: t('outdoor.description'), features: t('outdoor.features').split('|') },
    { key: 'commercial', title: t('commercial.title'), description: t('commercial.description'), features: t('commercial.features').split('|') },
  ];

  const [openKey, setOpenKey] = useState<string | null>(items[0].key);

  return (
    <section id="sprendimai" className="py-24 w-[1440px] mx-auto">
      <div className="mb-12">
        <p className="font-['Outfit'] text-xs uppercase tracking-[0.6px] mb-4">{t('eyebrow')}</p>
        <h2 className="font-['DM_Sans'] text-5xl md:text-6xl font-light tracking-[-2px] leading-[1.1] max-w-3xl">{t('heading')}</h2>
      </div>
      <div className="divide-y divide-[#bbbbbb] border-y border-[#bbbbbb] bg-[#eaeaea] rounded-[12px] overflow-hidden">
        {items.map(item => {
          const isOpen = openKey === item.key;
          return (
            <div key={item.key}>
              <button
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-white transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-['DM_Sans'] text-2xl tracking-[-0.5px] font-medium">{item.title}</span>
                <span className="text-sm font-['Outfit'] uppercase tracking-[0.6px]">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-8 pb-8 animate-fadeIn">
                  <p className="text-sm font-['Outfit'] leading-relaxed mb-4">{item.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-center text-xs font-['Outfit'] tracking-[0.4px] text-[#161616]">
                        <span className="w-1.5 h-1.5 bg-[#161616] rounded-full mr-3" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
