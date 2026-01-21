'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { assets } from '@/lib/assets';
import ArrowRight from '@/components/icons/ArrowRight';
import { toLocalePath } from '@/i18n/paths';
import { getContainerPadding, getSectionSpacing } from '@/lib/design-system';

const [imgProject1] = assets.projects;
const imgAboutVideoThumb = '/assets/about/fire.png';

const partnerNames = ['RIMLT', 'BIKUVA', 'SANKA', 'METALLUM', 'Diktum', 'Sidergas', 'BAU'];

const partnerLogos: Record<
  string,
  {
    src: string;
    alt: string;
  }
> = {
  RIMLT: { src: '/assets/partners/primlt-2.png', alt: 'RIMLT' },
  BIKUVA: { src: '/assets/partners/bikuva-1.png', alt: 'BIKUVA' },
  SANKA: { src: '/assets/partners/chamber-1.png', alt: 'SANKA' },
  METALLUM: { src: '/assets/partners/metallum-1.png', alt: 'METALLUM' },
  Diktum: { src: '/assets/partners/diktum-1.png', alt: 'Diktum' },
  Sidergas: { src: '/assets/partners/sidergas-1.png', alt: 'Sidergas' },
  BAU: { src: '/assets/partners/BAUEN-1.png', alt: 'BAU' },
};

function PartnersMarquee({
  items,
  durationSeconds = 26,
  fullBleed = false,
}: {
  items: string[];
  durationSeconds?: number;
  fullBleed?: boolean;
}) {
  const repeated = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden ${
        fullBleed ? 'w-full' : ''
      }`}
    >
      <div
        className="yw-marquee-track flex gap-[16px]"
        style={{ ['--yw-marquee-duration' as any]: `${durationSeconds}s` } as React.CSSProperties}
        aria-hidden="true"
      >
        {repeated.map((name, index) => (
          (() => {
            const logo = partnerLogos[name];

            return (
          <div
            // index is required here because we intentionally duplicate items.
            key={`${name}-${index}`}
            className="bg-[#EAEAEA] rounded-[8px] h-[140px] w-[180px] lg:h-[210px] lg:w-[213px] shrink-0 flex items-center justify-center"
          >
            {logo ? (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={160}
                height={64}
                sizes="(min-width: 1024px) 160px, 140px"
                className="object-contain w-[140px] h-[56px] lg:w-[160px] lg:h-[64px]"
              />
            ) : (
              <span className="font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                {name}
              </span>
            )}
          </div>
            );
          })()
        ))}
      </div>

      <span className="sr-only">{items.join(', ')}</span>
    </div>
  );
}

export default function AboutUs() {
  const t = useTranslations('home.aboutUs');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const aboutHref = toLocalePath('/about', currentLocale);

  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const videoSrc = useMemo(() => {
    const base = 'https://www.youtube.com/embed/61yqRQ5lO88';
    const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1' });
    return `${base}?${params.toString()}`;
  }, []);

  useEffect(() => {
    if (!isVideoOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVideoOpen]);

  return (
    <section id="about-us" className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) ===== */}
      <div className="lg:hidden pt-[64px] md:pt-[80px] lg:pt-[120px] pb-0">
        <div className={`${getContainerPadding()} mb-[24px]`}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            {t('eyebrow')}
          </p>
          <h2 className="font-['DM_Sans'] font-light leading-none text-[#161616] max-w-[520px]" style={{ fontSize: 'clamp(34px, 6vw, 44px)', letterSpacing: 'clamp(-1.6px, -0.04em, -1.76px)' }}>
            <span>{t('headline.prefix')}</span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.quality')}</span>
            <span>{t('headline.middle')}</span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.passion')}</span>
          </h2>
        </div>

        <div className="px-[16px] md:px-[32px] flex flex-col gap-[24px]">
          <div className="flex items-start gap-[16px]">
            <div className="relative w-[96px] h-[96px] rounded-[8px] overflow-hidden shrink-0">
              <Image src={imgProject1} alt="" fill className="object-cover" />
            </div>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
              {t('description1')}
            </p>
          </div>

          <div className="relative w-full h-[360px] rounded-[8px] overflow-hidden">
            <Image src={imgAboutVideoThumb} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="w-[64px] h-[64px] rounded-full bg-[#161616]/75 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#161616] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E1E1E1]"
                aria-label={t('aria.watchVideo')}
              >
                <span className="font-['Outfit'] font-normal text-[10px] tracking-[0.6px] uppercase text-white">{t('watch')}</span>
              </button>
            </div>
          </div>

          <Link href={aboutHref} className="flex gap-[8px] items-center h-[24px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              {t('readAbout')}
            </p>
            <ArrowRight color="#161616" />
          </Link>
        </div>

        <div className="mt-[40px]">
          <p className="px-[16px] md:px-[32px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[16px]">
            {t('partners')}
          </p>
          <PartnersMarquee items={partnerNames} durationSeconds={22} fullBleed />
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] pt-[200px] pb-[120px]">
        <div className="relative h-[160px]">
          <p className="absolute left-0 top-[26px] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
            {t('eyebrow')}
          </p>

          <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] w-[760px]">
            <span>{t('headline.prefix')}</span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.quality')}</span>
            <span>{t('headline.middle')}</span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.passion')}</span>
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
              <Image src={imgAboutVideoThumb} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/15" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="w-[72px] h-[72px] rounded-full bg-[#161616]/75 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#161616] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E1E1E1]"
                  aria-label={t('aria.watchVideo')}
                >
                  <span className="font-['Outfit'] font-normal text-[10px] tracking-[0.6px] uppercase text-white">{t('watch')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Text column */}
          <div className="col-span-3 col-start-10 flex flex-col gap-[40px]">
            <div className="flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
                {t('description1')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#535353]">
                {t('description2')}
              </p>
            </div>

            <Link href={aboutHref} className="flex gap-[8px] items-center h-[24px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                {t('readAbout')}
              </p>
              <ArrowRight color="#161616" />
            </Link>
          </div>
        </div>

        <p className="mt-[64px] ml-[calc(25%+24px)] font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
          {t('partners')}
        </p>

        <div className="mt-[24px]">
          <PartnersMarquee items={partnerNames} durationSeconds={30} fullBleed />
        </div>
      </div>

      {isVideoOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-[16px]"
          role="dialog"
          aria-modal="true"
          aria-label={t('aria.dialog')}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsVideoOpen(false)}
            aria-label={t('aria.closeVideo')}
          />

          <div className="relative w-full max-w-[960px] bg-black rounded-[12px] overflow-hidden shadow-2xl">
            <div className="absolute right-[12px] top-[12px] z-10">
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="h-[36px] px-[12px] rounded-[100px] bg-white/10 text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t('close')}
              </button>
            </div>

            <div className="relative w-full aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={videoSrc}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
