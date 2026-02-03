'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { assets, getAsset } from '@/lib/assets';
import InView from '@/components/InView';

const imgMask = getAsset('imgMask');

const swatchIcons = {
  black: assets.colorSwatches[0],
  darkBrown: assets.colorSwatches[1],
  carbon: assets.colorSwatches[2],
  latte: assets.colorSwatches[3],
  silver: assets.colorSwatches[4],
  carbonLight: assets.colorSwatches[5],
  graphite: assets.colorSwatches[6],
  natural: assets.colorSwatches[7],
} as const;

const spruceFinishes = assets.finishes.spruce;
const larchFinishes = assets.finishes.larch;

// Product type
type ProductData = {
  id: string;
  image: string;
  slides: { image: string; label: string; swatch: string }[];
  title: string;
  price: number;
  description: string;
  solutions: Array<'facade' | 'fence' | 'terrace' | 'interior'>;
};

function SliderArrows({
  onPrev,
  onNext,
  prevAriaLabel,
  nextAriaLabel,
  className = '',
}: {
  onPrev: () => void;
  onNext: () => void;
  prevAriaLabel: string;
  nextAriaLabel: string;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={prevAriaLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrev();
        }}
        className={`absolute left-[12px] top-1/2 -translate-y-1/2 z-20 ${className}`}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#fff" fillOpacity="0.75" />
          <path
            d="M19 23L13 16L19 9"
            stroke="#161616"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label={nextAriaLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNext();
        }}
        className={`absolute right-[12px] top-1/2 -translate-y-1/2 z-20 ${className}`}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#fff" fillOpacity="0.75" />
          <path
            d="M13 9L19 16L13 23"
            stroke="#161616"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}

function usePreloadImages(urls: string[]) {
  const uniqueUrls = useMemo(() => Array.from(new Set(urls)).filter(Boolean), [urls]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    for (const url of uniqueUrls) {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = url;
    }
  }, [uniqueUrls]);
}

// Mobile Product Card - Figma 803:13034 (303x532px)
function MobileProductCard({
  product,
  colorsLabel,
  selectColorAria,
  prevImageAria,
  nextImageAria,
  tSolutions,
}: {
  product: ProductData;
  colorsLabel: string;
  selectColorAria: (params: { label: string; index: number; total: number }) => string;
  prevImageAria: string;
  nextImageAria: string;
  tSolutions: (key: 'facade' | 'fence' | 'terrace' | 'interior') => string;
}) {
  const slides = useMemo(
    () => (product.slides.length > 0 ? product.slides : [{ image: product.image, label: '', swatch: swatchIcons.natural }]),
    [product.slides, product.image]
  );

  usePreloadImages(useMemo(() => slides.map((s) => s.image), [slides]));

  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    const safeIndex = ((index % slides.length) + slides.length) % slides.length;
    setCurrentIndex(safeIndex);
  };

  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[12px] pb-[16px] px-[16px] w-full flex flex-col gap-[24px] items-center relative">
      {/* Background mask overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>

      {/* Product image slider - full bleed to screen edges on mobile */}
      <div className="relative w-[calc(100%+32px)] -mx-[16px] aspect-[4/3] shrink-0 z-10 md:mx-0 md:w-full md:px-0">
        <div className="relative w-full h-full rounded-[8px] overflow-hidden">
          <Image
            src={slides[currentIndex]?.image || product.image}
            alt={product.title}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />

          {!!slides[currentIndex]?.label && (
            <div className="absolute bottom-[12px] right-[12px] z-20">
              <span className="font-['Outfit'] font-medium text-[14px] leading-[1.1] tracking-[1.2px] uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                {slides[currentIndex].label}
              </span>
            </div>
          )}

          <SliderArrows
            onPrev={() => goTo(currentIndex - 1)}
            onNext={() => goTo(currentIndex + 1)}
            prevAriaLabel={prevImageAria}
            nextAriaLabel={nextImageAria}
          />
        </div>
      </div>

      {/* Content container - 279px width */}
  <div className="w-full flex flex-col gap-[16px] relative z-10">
        {/* Solution chips */}
        <div className="flex gap-[8px] items-center justify-start flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">
                  {tSolutions(sol)}
              </p>
            </div>
          ))}
        </div>

        {/* Title & Price row */}
        <div className="flex items-center justify-between w-full">
          <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
            {product.title}
          </p>
          <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
            nuo {product.price} €
          </p>
        </div>

        {/* Description */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full">
          {product.description}
        </p>

        {/* Colors section */}
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">{colorsLabel}</p>
          <div className="flex flex-wrap gap-[12px] items-center">
            {slides.map((slide, idx) => (
              <button
                key={`${product.id}-thumb-${idx}`}
                type="button"
                aria-label={selectColorAria({
                  label: slide.label || product.title,
                  index: idx + 1,
                  total: slides.length,
                })}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(idx);
                }}
                className={
                  idx === currentIndex
                    ? 'w-[32px] h-[32px] rounded-full bg-white p-[4px]'
                    : 'w-[32px] h-[32px] rounded-full'
                }
              >
                <span className="relative block w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.label || product.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Product Card
function DesktopProductCard({
  product,
  colorsLabel,
  selectColorAria,
  prevImageAria,
  nextImageAria,
  tSolutions,
}: {
  product: ProductData;
  colorsLabel: string;
  selectColorAria: (params: { label: string; index: number; total: number }) => string;
  prevImageAria: string;
  nextImageAria: string;
  tSolutions: (key: 'facade' | 'fence' | 'terrace' | 'interior') => string;
}) {
  const slides = useMemo(
    () => (product.slides.length > 0 ? product.slides : [{ image: product.image, label: '', swatch: swatchIcons.natural }]),
    [product.slides, product.image]
  );

  usePreloadImages(useMemo(() => slides.map((s) => s.image), [slides]));

  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    const safeIndex = ((index % slides.length) + slides.length) % slides.length;
    setCurrentIndex(safeIndex);
  };

  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[24px] pb-[40px] px-[24px] flex-1 min-w-0 flex flex-col gap-[24px] items-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>

      <div className="relative w-full aspect-[395/311] shrink-0 z-10 rounded-[8px] overflow-hidden">
        <Image
          src={slides[currentIndex]?.image || product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 395px, 100vw"
        />

        {!!slides[currentIndex]?.label && (
          <div className="absolute bottom-[12px] right-[12px] z-20">
            <span className="font-['Outfit'] font-medium text-[14px] leading-[1.1] tracking-[1.2px] uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              {slides[currentIndex].label}
            </span>
          </div>
        )}

        <SliderArrows
          onPrev={() => goTo(currentIndex - 1)}
          onNext={() => goTo(currentIndex + 1)}
          prevAriaLabel={prevImageAria}
          nextAriaLabel={nextImageAria}
        />
      </div>

      <div className="w-full flex flex-col gap-[16px] relative z-10">
        <div className="flex gap-[8px] items-center justify-start flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{tSolutions(sol)}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start justify-between w-full leading-[1.1] font-['DM_Sans'] font-normal text-[32px] tracking-[-1.28px] text-[#161616]">
          <p className="shrink-0">{product.title}</p>
          <p className="shrink-0">nuo {product.price} €</p>
        </div>

        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full">
          {product.description}
        </p>

        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">{colorsLabel}</p>
          <div className="flex flex-wrap gap-[12px] items-center">
            {slides.map((slide, idx) => (
              <button
                key={`${product.id}-thumb-desktop-${idx}`}
                type="button"
                aria-label={selectColorAria({
                  label: slide.label || product.title,
                  index: idx + 1,
                  total: slides.length,
                })}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(idx);
                }}
                className={
                  idx === currentIndex
                    ? 'w-[32px] h-[32px] rounded-full bg-white p-[4px]'
                    : 'w-[32px] h-[32px] rounded-full'
                }
              >
                <span className="relative block w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.label || product.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('home.products');
  const tSolutions = useTranslations('productPage.solutions');

  const shopHref = toLocalePath('/products', locale);

  const products = useMemo<ProductData[]>(
    () => [
      {
        id: 'spruce-wood',
        image: spruceFinishes.natural,
        slides: [
          { image: spruceFinishes.natural, label: 'Natural', swatch: swatchIcons.natural },
          { image: spruceFinishes.silver, label: 'Silver', swatch: swatchIcons.silver },
          { image: spruceFinishes.carbon, label: 'Carbon', swatch: swatchIcons.carbon },
          { image: spruceFinishes.carbonLight, label: 'Carbon light', swatch: swatchIcons.carbonLight },
          { image: spruceFinishes.graphite, label: 'Graphite', swatch: swatchIcons.graphite },
          { image: spruceFinishes.latte, label: 'Latte', swatch: swatchIcons.latte },
          { image: spruceFinishes.darkBrown, label: 'Dark brown', swatch: swatchIcons.darkBrown },
          { image: spruceFinishes.black, label: 'Black', swatch: swatchIcons.black },
        ],
        title: t('items.spruce.title'),
        price: 89,
        description: t('items.spruce.description'),
        solutions: ['facade', 'fence', 'terrace', 'interior'],
      },
      {
        id: 'larch-wood',
        image: larchFinishes.natural,
        slides: [
          { image: larchFinishes.natural, label: 'Natural', swatch: swatchIcons.natural },
          { image: larchFinishes.silver, label: 'Silver', swatch: swatchIcons.silver },
          { image: larchFinishes.carbon, label: 'Carbon', swatch: swatchIcons.carbon },
          { image: larchFinishes.carbonLight, label: 'Carbon light', swatch: swatchIcons.carbonLight },
          { image: larchFinishes.graphite, label: 'Graphite', swatch: swatchIcons.graphite },
          { image: larchFinishes.latte, label: 'Latte', swatch: swatchIcons.latte },
          { image: larchFinishes.darkBrown, label: 'Dark brown', swatch: swatchIcons.darkBrown },
          { image: larchFinishes.black, label: 'Black', swatch: swatchIcons.black },
        ],
        title: t('items.larch.title'),
        price: 89,
        description: t('items.larch.description'),
        solutions: ['facade', 'fence', 'terrace', 'interior'],
      },
    ],
    [t]
  );

  const colorsLabel = t('labels.colors');
  const prevImageAria = t('aria.prevImage');
  const nextImageAria = t('aria.nextImage');
  const selectColorAria = ({ label, index, total }: { label: string; index: number; total: number }) =>
    t('aria.selectColor', { label, index, total });

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1536px) - Figma 803:13029 ===== */}
      <InView className="2xl:hidden hero-animate-root">
        {/* Title Section - Mobile */}
        <div className="px-[16px] pt-[64px] pb-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            {t('eyebrow')}
          </p>
          <p className="font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616] w-full max-w-[358px]">
            <span>{t('headline.prefix')}</span>
            <span className="font-['Tiro_Tamil'] italic">{t('headline.emphasis')}</span>
            <span>{t('headline.suffix')}</span>
          </p>
        </div>

        {/* Stacked product cards (no horizontal scroll) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] px-[16px] min-[520px]:px-0 pb-[24px]">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="w-full hero-seq-item hero-seq-right"
              style={{ animationDelay: `${220 + idx * 180}ms` }}
            >
              <MobileProductCard
                product={product}
                colorsLabel={colorsLabel}
                selectColorAria={selectColorAria}
                prevImageAria={prevImageAria}
                nextImageAria={nextImageAria}
                tSolutions={tSolutions}
              />
            </div>
          ))}
        </div>

        {/* Removed mobile GET AN OFFER button per request */}
      </InView>

      {/* ===== DESKTOP LAYOUT (>= 1536px) ===== */}
      <InView className="hidden 2xl:block max-w-[1440px] mx-auto px-[40px] relative hero-animate-root">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+14px)] */}
        <div className="relative h-[160px] text-[#161616] z-10 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <p className="absolute font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase left-[0px] top-[23px]">
            {t('eyebrow')}
          </p>
          <p className="absolute font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] left-[calc(25%+14px)] top-[0px]">
            <span>{t('headline.prefix')}</span>
            <span className="inline-flex whitespace-nowrap">
              <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">{t('headline.emphasis')}</span>
              <span>&nbsp;{t('headline.suffix')}</span>
            </span>
          </p>
        </div>

        {/* Products Grid - full-width so card edges align with content edges */}
        <div className="mt-[58px] flex w-full justify-between gap-[40px]">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-0 hero-seq-item hero-seq-right"
              style={{ animationDelay: `${220 + idx * 180}ms` }}
            >
              <DesktopProductCard
                product={product}
                colorsLabel={colorsLabel}
                selectColorAria={selectColorAria}
                prevImageAria={prevImageAria}
                nextImageAria={nextImageAria}
                tSolutions={tSolutions}
              />
            </div>
          ))}
        </div>

        {/* View Catalog Button */}
        <div className="mt-[48px] flex justify-center hero-seq-item hero-seq-right" style={{ animationDelay: '680ms' }}>
          <Link
            href={shopHref}
            className="bg-[#161616] px-[40px] py-[10px] h-[48px] rounded-[100px] w-[296px] flex items-center justify-center gap-[10px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              {t('cta.catalog')}
            </span>
          </Link>
        </div>

        <div className="pb-[64px]" />
      </InView>
    </section>
  );
}
