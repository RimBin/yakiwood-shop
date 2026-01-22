import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getSectionPadding, getGap } from '@/lib/design-system';
import { assets } from '@/lib/assets';

export default async function WhyUs() {
  const t = await getTranslations('home.whyUs');

  const benefits = [
    {
      id: 'aesthetics',
      primary: assets.icons.fire,
    },
    {
      id: 'look',
      primary: assets.icons.warehouse,
    },
    {
      id: 'eco',
      primary: assets.icons.plantSvg,
    },
    {
      id: 'versatile',
      primary: assets.icons.cube,
    },
  ] as const;

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7566 ===== */}
      <div className={`xl:hidden ${getSectionPadding('x')} pt-[64px] md:pt-[80px] lg:pt-[120px] pb-0`}>
        {/* Title Section - Mobile/Tablet */}
        <div className={`flex flex-col ${getGap('sm')} mb-[16px] md:mb-[24px]`}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            {t('eyebrow')}
          </p>
          <p className="font-['DM_Sans'] font-light leading-none text-[#161616] max-w-[700px]" style={{ fontSize: 'clamp(32px, 5vw, 44px)', letterSpacing: 'clamp(-1.28px, -0.04em, -1.76px)' }}>
            {t.rich('headline', {
              italic: (chunks) => <span className="font-['Tiro_Tamil'] italic">{chunks}</span>,
            })}
          </p>
        </div>

        {/* Description - Mobile/Tablet */}
        <p className="font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[600px] mb-[24px] md:mb-[32px]">
          {t('description')}
        </p>

        {/* Benefits Cards - Responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[8px] md:gap-[16px]">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-[#eaeaea] rounded-[8px] p-[16px] w-full flex flex-col gap-[16px] items-start">
              {/* Icon */}
              <div className="border-[#bbbbbb] border-[0.5px] border-solid rounded-[100px] w-[48px] h-[48px] relative overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px]">
                  <Image src={benefit.primary} alt={t(`benefits.${benefit.id}.alt`)} width={24} height={24} />
                </div>
              </div>
              {/* Text */}
              <div className="flex flex-col gap-[4px] items-start w-full">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {t(`benefits.${benefit.id}.title`)}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                  {t(`benefits.${benefit.id}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden xl:block w-full max-w-[1440px] mx-auto px-[40px] pt-[200px] pb-[200px]">
        {/* Label */}
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] -mb-[30px]">
          {t('eyebrow')}
        </p>

        {/* Main text */}
        <p className="font-['DM_Sans'] font-light text-[52px] leading-none tracking-[-2.08px] text-[#161616] max-w-[1360px] mb-[24px] indent-[344px]">
          {t.rich('headline', {
            italic: (chunks) => <span className="font-['Tiro_Tamil'] italic">{chunks}</span>,
          })}
        </p>

        {/* Description text */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[312px] ml-[688px] mb-[24px]">
          {t('description')}
        </p>

        {/* Benefits cards */}
        <div className="flex gap-[16px] items-center">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-[#eaeaea] rounded-[8px] p-[16px] w-[328px] flex flex-col gap-[24px] items-start">
              <div className="border-[#bbbbbb] border-[0.5px] border-solid rounded-[100px] w-[48px] h-[48px] relative overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px]">
                  <Image src={benefit.primary} alt={t(`benefits.${benefit.id}.alt`)} width={24} height={24} />
                </div>
              </div>
              <div className="flex flex-col gap-[8px] items-start w-full">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {t(`benefits.${benefit.id}.title`)}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[257px]">
                  {t(`benefits.${benefit.id}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
