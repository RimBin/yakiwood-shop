'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getSectionPadding } from '@/lib/design-system';
import { assets } from '@/lib/assets';
import { toLocalePath } from '@/i18n/paths';
import InView from '@/components/InView';

// Shared background image for CTA section
const backgroundImage = assets.ctaBackground;

export default function CTA() {
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const t = useTranslations('home.cta');

  return (
    <section className="relative w-full overflow-hidden bg-[#E1E1E1]">
      {/* Background Image with opacity and luminosity blend */}
      <div className="absolute pointer-events-none mix-blend-luminosity opacity-[0.18] z-0 inset-0">
        {/* Mobile: large circular artwork centered behind the content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmin] h-[100vmin] md:w-[90vmin] md:h-[90vmin] lg:w-[1000px] lg:h-[1000px]">
          <Image src={backgroundImage} alt="" fill className="object-contain" sizes="100vw" />
        </div>
      </div>

      {/* ===== MOBILE LAYOUT (< 1536px) - Figma 759:7625 ===== */}
      <InView className={`2xl:hidden relative z-10 flex flex-col items-center justify-center h-[580px] ${getSectionPadding()} md:mt-[40px] md:mb-[40px] hero-animate-root`}>
        {/* Heading - Mobile/Tablet */}
        <h2 className="-mt-[200px] md:mt-0 font-['DM_Sans'] font-light text-center max-w-[600px] mb-[12px] md:mb-[40px] hero-seq-item hero-seq-right" style={{ fontSize: 'clamp(40px, 7vw, 64px)', lineHeight: 1, letterSpacing: 'clamp(-1.8px, -0.04em, -2.56px)', animationDelay: '0ms' }}>
          <span>{t('headline.prefix')}</span>
          <span className="font-['Tiro_Tamil'] italic">{t('headline.emphasis')}</span>
          <span>{t('headline.suffix')}</span>
        </h2>

        {/* Buttons - Mobile/Tablet */}
        <div className="flex flex-col md:flex-row gap-[16px] w-full md:w-auto md:justify-center max-w-[358px] md:max-w-none hero-seq-item hero-seq-right" style={{ animationDelay: '260ms' }}>
          {/* Primary Button - GET AN OFFER */}
          <Link
            href={toLocalePath('/produktai', currentLocale)}
            className="bg-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full md:w-[240px] md:px-[40px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              {t('buttons.offer')}
            </span>
          </Link>

          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="border border-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full md:w-[240px] md:px-[40px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              {t('buttons.getInTouch')}
            </span>
          </Link>
        </div>
      </InView>

      {/* ===== DESKTOP LAYOUT (>= 1536px) ===== */}
      <InView className="hidden 2xl:flex relative z-10 flex-col items-center justify-center min-h-[1053px] py-[113px] px-[40px] hero-animate-root">
        {/* Heading - Desktop */}
        <h2 className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] tracking-[-6.4px] text-[#161616] text-center mb-[66px] w-[861px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <span>{t('headline.prefix')}</span>
          <span className="font-['Tiro_Tamil'] italic">{t('headline.emphasis')}</span>
          <span>{t('headline.suffix')}</span>
        </h2>

        {/* Action Buttons - Desktop: Side by Side */}
        <div className="flex gap-[16px] items-center justify-center hero-seq-item hero-seq-right" style={{ animationDelay: '260ms' }}>
          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="border border-[#161616] flex items-center justify-center h-[48px] w-[240px] px-[40px] py-[10px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              {t('buttons.getInTouch')}
            </span>
          </Link>

          {/* Primary Button - CHOOSE WOOD */}
          <Link
            href={toLocalePath('/produktai', currentLocale)}
            className="bg-[#161616] flex items-center justify-center h-[48px] w-[240px] px-[40px] py-[10px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              {t('buttons.chooseWood')}
            </span>
          </Link>
        </div>
      </InView>
    </section>
  );
}
