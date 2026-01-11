'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { assets } from '@/lib/assets';
import ArrowRight from '@/components/icons/ArrowRight';
import { toLocalePath } from '@/i18n/paths';
import { getContainerPadding, getSectionSpacing } from '@/lib/design-system';

const [imgProject1, imgProject2] = assets.projects;

const partnerNames = ['RIMLT', 'BIKUVA', 'SANKA', 'METALLUM', 'Diktum', 'Sidergas', 'BAU'];

export default function AboutUs() {
  const t = useTranslations('about');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const aboutHref = toLocalePath('/about', currentLocale);

  return (
    <section id="about-us" className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) ===== */}
      <div className={`lg:hidden ${getSectionSpacing()}`}>
        <div className={`${getContainerPadding()} mb-[24px]`}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            {t('pavadinimas')}
          </p>
          <h2 className="font-['DM_Sans'] font-light leading-none text-[#161616] max-w-[520px]" style={{ fontSize: 'clamp(34px, 6vw, 44px)', letterSpacing: 'clamp(-1.6px, -0.04em, -1.76px)' }}>
            Our story: crafting <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">quality</span> with{' '}
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">passion</span>
          </h2>
        </div>

        <div className="px-[16px] md:px-[32px] flex flex-col gap-[24px]">
          <div className="flex items-start gap-[16px]">
            <div className="relative w-[96px] h-[96px] rounded-[8px] overflow-hidden shrink-0">
              <Image src={imgProject1} alt="" fill className="object-cover" />
            </div>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
              We honor the ancient Japanese art of Shou Sugi Ban, transforming wood with fire to create beautiful, durable, and sustainable products.
            </p>
          </div>

          <div className="relative w-full h-[360px] rounded-[8px] overflow-hidden">
            <Image src={imgProject2} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#161616]/75 flex items-center justify-center">
                <span className="font-['Outfit'] font-normal text-[10px] tracking-[0.6px] uppercase text-white">Watch</span>
              </div>
            </div>
          </div>

          <Link href={aboutHref} className="flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              Read about us
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>

        <div className="mt-[40px]">
          <p className="px-[16px] md:px-[32px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[16px]">
            Our partners
          </p>
          <div className="flex gap-[16px] overflow-x-auto scrollbar-hide px-[16px] md:px-[32px] pb-[8px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {partnerNames.map((name) => (
              <div key={name} className="bg-[#EAEAEA] rounded-[8px] h-[140px] w-[180px] shrink-0 flex items-center justify-center">
                <span className="font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] pt-[200px] pb-[120px]">
        <div className="relative h-[160px]">
          <p className="absolute left-0 top-[26px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            about us
          </p>

          <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[760px]">
            <span>Our story: crafting </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">quality</span>
            <span> with </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">passion</span>
          </p>
        </div>

        <div className="grid grid-cols-12 gap-[40px] mt-[64px]">
          {/* Left small image */}
          <div className="col-span-2">
            <div className="relative w-[175px] h-[175px] rounded-[8px] overflow-hidden">
              <Image src={imgProject1} alt="" fill className="object-cover" />
            </div>
          </div>

          {/* Video tile */}
          <div className="col-span-6 col-start-4">
            <div className="relative w-full h-[623px] rounded-[8px] overflow-hidden">
              <Image src={imgProject2} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/15" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[72px] h-[72px] rounded-full bg-[#161616]/75 flex items-center justify-center">
                  <span className="font-['Outfit'] font-normal text-[10px] tracking-[0.6px] uppercase text-white">Watch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text column */}
          <div className="col-span-3 col-start-10 flex flex-col gap-[40px]">
            <div className="flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
                We honor the ancient Japanese art of Shou Sugi Ban, transforming wood with fire to create beautiful, durable, and sustainable products.
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
                Our expertise combines tradition with innovation, delivering high-quality wood planks that enhance and protect any space.
              </p>
            </div>

            <Link href={aboutHref} className="flex gap-[8px] items-center h-[24px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                Read about us
              </p>
              <ArrowRight color="#161616" />
            </Link>
          </div>
        </div>

        <p className="mt-[64px] ml-[calc(25%+24px)] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
          Our partners
        </p>

        <div className="mt-[24px] flex gap-[16px] justify-center">
          {partnerNames.map((name) => (
            <div key={name} className="bg-[#EAEAEA] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center">
              <span className="font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
