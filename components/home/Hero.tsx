import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { assets } from '@/lib/assets';
import { toLocalePath } from '@/i18n/paths';

const imgProductImage = assets.projects[0];
const certifications = [assets.certifications.fsc, assets.certifications.eu, assets.certifications.epd];

export default async function Hero() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const tHero = await getTranslations('hero');
  const tSolutions = await getTranslations('productPage.solutions');

  return (
    <section className="w-full bg-[#EAEAEA] relative overflow-hidden">
      {/* Full-width hero vector background */}
      <div className="absolute inset-0">
        <Image src={assets.heroVector} alt="" fill className="object-cover" priority />
      </div>

      {/* ===== MOBILE LAYOUT (< 1024px) ===== */}
      <div className="lg:hidden flex flex-col">
        <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
          <p className="font-['DM_Sans'] font-light text-[45px] leading-none tracking-[-1.8px] text-[#161616] w-[355px] whitespace-pre-wrap">
            {tHero('mainHeading')}
            <span className="font-['Tiro_Tamil'] italic">{tHero('brandName')}</span>
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] w-[323px]">
            {tHero('description')}
          </p>
        </div>

        <div className="relative w-full">
          <div className="bg-[#bbab92] w-full h-[423px] relative">
            <div className="absolute left-[8.34px] top-0 w-[367px] h-[309.127px] flex items-center justify-center overflow-hidden">
              <div className="rotate-[333.068deg]">
                <div className="w-[317.433px] h-[185.467px] relative">
                  <Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-4 bottom-[35px] right-4 bg-white/10 backdrop-blur-[20px] border border-white/50 rounded-[16px] p-3 flex flex-col gap-3">
            <div className="flex items-start justify-between w-full">
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white">{tHero('productName')}</p>
              <div className="flex gap-1 items-center text-white">
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">{tHero('from')}</p>
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px]">89 €</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">{tHero('solutions')}</p>
              <div className="flex gap-1">
                {(['facade', 'fence', 'terrace', 'interior'] as const).map((key) => (
                  <div key={key} className="bg-white/40 px-2 h-[24px] rounded-[4px] flex items-center justify-center">
                    <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{tSolutions(key)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">{tHero('colors')}</p>
              <div className="flex items-center">
                {assets.colorSwatches.map((src, i) => (
                  <div
                    key={src}
                    className="-mr-[4px] w-[24px] h-[24px] relative rounded-full overflow-hidden border border-white/40"
                    style={{ zIndex: assets.colorSwatches.length - i }}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={toLocalePath('/products', currentLocale)}
              className="bg-white h-[48px] rounded-[100px] flex items-center justify-center w-full"
              aria-label={tHero('buyNow')}
            >
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">{tHero('buyNow')}</span>
            </Link>
          </div>
        </div>

        <div className="w-full bg-[#161616] px-4 py-2 flex items-center justify-between">
          {certifications.map((src) => (
            <div key={src} className="h-[28px] w-[56px] relative">
              <Image src={src} alt="" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block relative w-full min-h-[861px]">
        {/* Centered content container */}
        <div className="relative max-w-[1440px] mx-auto h-full">
          <div className="absolute left-[40px] top-[190px] flex flex-col gap-[24px] z-10">
            <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[606px] whitespace-pre-wrap">
              {tHero('mainHeading')}
              <span className="font-['Tiro_Tamil'] italic tracking-[-1.6px]">{tHero('brandName')}</span>
            </p>

            <div className="flex flex-col gap-[24px] overflow-clip">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] w-[323px] whitespace-pre-wrap">
                {tHero('description')}
              </p>

              <Link
                href={toLocalePath('/products', currentLocale)}
                className="border border-[#161616] border-solid px-[40px] py-[10px] h-[48px] rounded-[100px] flex items-center justify-center gap-[10px] w-fit"
              >
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">{tHero('exploreCatalog')}</span>
              </Link>

              <div className="relative h-[22px] w-[280px]">
                <Image src={assets.payments} alt="Payments" fill className="object-contain" />
              </div>
            </div>
          </div>

          <div className="absolute left-[calc(50%+10px)] top-[125px] z-10">
            <div className="bg-[#bbab92] rounded-[24px] w-[670px] h-[654px]" />

            <div className="absolute left-[2px] top-[42.86px] w-[663.054px] h-[558.481px] flex items-center justify-center overflow-hidden">
              <div className="rotate-[333.068deg]">
                <div className="w-[573.487px] h-[335.073px] relative"><Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" /></div>
              </div>
            </div>

            <div className="absolute left-[311px] top-[352px] bg-white/10 backdrop-blur-[20px] border border-white/50 border-solid rounded-[24px] p-[16px] w-[351px] flex flex-col gap-[16px]">
              <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-white w-[292px] whitespace-pre-wrap">{tHero('productName')}</p>

              <div className="flex gap-[8px] items-center text-white">
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">{tHero('from')}</p>
                <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px]">89 €</p>
              </div>

              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white">{tHero('solutions')}</p>
                <div className="flex gap-[4px]">
                  {(['facade', 'fence', 'terrace', 'interior'] as const).map((key) => (
                    <div key={key} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]"><p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{tSolutions(key)}</p></div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] tracking-[-0.24px] text-white w-full whitespace-pre-wrap">{tHero('colors')}</p>
                <div className="flex items-center isolate">
                  {assets.colorSwatches.map((src, i) => (
                    <div
                      key={src}
                      className="-mr-[6px] w-[32px] h-[32px] relative rounded-full overflow-hidden border border-white/40"
                      style={{ zIndex: assets.colorSwatches.length - i }}
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={toLocalePath('/products', currentLocale)}
                className="bg-white px-[40px] py-[10px] h-[48px] rounded-[100px] flex items-center justify-center gap-[10px] w-full"
                aria-label={tHero('buyNow')}
              >
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">{tHero('buyNow')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Fullwidth certification bar */}
        <div className="absolute left-0 right-0 top-[800px] w-full bg-[#161616] py-[16px] flex items-center justify-center z-10">
          <div className="flex gap-[150px] items-center">
            {certifications.map((src) => (
              <div key={src} className="h-[32px] w-[72px] relative">
                <Image src={src} alt="" fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
