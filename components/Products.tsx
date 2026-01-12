'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { assets, getAsset } from '@/lib/assets';

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
  solutions: string[];
};

const products: ProductData[] = [
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
    title: 'Spruce wood',
    price: 89,
    description:
      'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
    solutions: ['Facades', 'Fence', 'Terrace', 'Interior'],
  },
  {
    id: 'larch-wood-1',
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
    title: 'Larch wood',
    price: 89,
    description:
      'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
    solutions: ['Facades', 'Fence', 'Terrace', 'Interior'],
  },
];

function SliderArrows({
  onPrev,
  onNext,
  className = '',
}: {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Previous image"
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
        aria-label="Next image"
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

// Mobile Product Card - Figma 803:13034 (303x532px)
function MobileProductCard({ product }: { product: ProductData }) {
  const slides = useMemo(
    () => (product.slides.length > 0 ? product.slides : [{ image: product.image, label: '', swatch: swatchIcons.natural }]),
    [product.slides, product.image]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    const safeIndex = ((index % slides.length) + slides.length) % slides.length;
    setCurrentIndex(safeIndex);
  };

  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[12px] pb-[16px] px-[12px] w-[303px] md:w-[360px] flex-shrink-0 flex flex-col gap-[24px] items-center relative">
      {/* Background mask overlay */}
      <div className="absolute left-0 top-0 w-[303px] h-[532px] pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>

      {/* Product image slider - 271x260px on mobile */}
      <div className="relative w-[271px] h-[260px] shrink-0 z-10 rounded-[8px] overflow-hidden">
        <Image src={slides[currentIndex]?.image || product.image} alt={product.title} fill className="object-cover" />

        {!!slides[currentIndex]?.label && (
          <div className="absolute bottom-[12px] left-[12px] z-20 flex gap-[8px] items-center">
            {product.solutions.map((s, i) => (
              <div key={i} className="bg-white/40 px-[8px] h-[20px] rounded-[4px] flex items-center justify-center">
                <span className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{s}</span>
              </div>
            ))}
          </div>
        )}

        <SliderArrows onPrev={() => goTo(currentIndex - 1)} onNext={() => goTo(currentIndex + 1)} />
      </div>

      {/* Content container - 279px width */}
      <div className="w-[279px] flex flex-col gap-[16px] relative z-10">
        {/* Solution chips */}
        <div className="flex gap-[8px] items-center justify-start flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">
                {sol}
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
            {product.price} €
          </p>
        </div>

        {/* Description */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full">
          {product.description}
        </p>

        {/* Colors section */}
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">Colors</p>
          <div className="flex flex-wrap gap-[12px] items-center">
            {slides.map((slide, idx) => (
              <button
                key={`${product.id}-thumb-${idx}`}
                type="button"
                aria-label={`Select ${slide.label || 'image'} (${idx + 1})`}
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
                  <Image src={slide.swatch} alt={slide.label || product.title} fill className="object-cover" />
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
function DesktopProductCard({ product }: { product: ProductData }) {
  const slides = useMemo(
    () => (product.slides.length > 0 ? product.slides : [{ image: product.image, label: '', swatch: swatchIcons.natural }]),
    [product.slides, product.image]
  );
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
        <Image src={slides[currentIndex]?.image || product.image} alt={product.title} fill className="object-cover" />

        {!!slides[currentIndex]?.label && (
          <div className="absolute bottom-[12px] left-[12px] z-20 flex gap-[8px] items-center">
            {product.solutions.map((s, i) => (
              <div key={i} className="bg-white/40 px-[8px] h-[20px] rounded-[4px] flex items-center justify-center">
                <span className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{s}</span>
              </div>
            ))}
          </div>
        )}

        <SliderArrows onPrev={() => goTo(currentIndex - 1)} onNext={() => goTo(currentIndex + 1)} />
      </div>

      <div className="w-full flex flex-col gap-[16px] relative z-10">
        <div className="flex gap-[8px] items-center justify-center flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{sol}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start justify-between w-full leading-[1.1] font-['DM_Sans'] font-normal text-[32px] tracking-[-1.28px] text-[#161616]">
          <p className="shrink-0">{product.title}</p>
          <p className="shrink-0">{product.price} €</p>
        </div>

        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full">
          {product.description}
        </p>

        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">Colors</p>
          <div className="flex gap-[12px] items-center overflow-clip">
            {slides.map((slide, idx) => (
              <button
                key={`${product.id}-thumb-desktop-${idx}`}
                type="button"
                aria-label={`Select ${slide.label || 'image'} (${idx + 1})`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(idx);
                }}
                className={
                  idx === currentIndex
                    ? 'w-[40px] h-[40px] rounded-full bg-white p-[4px]'
                    : 'w-[40px] h-[40px] rounded-full'
                }
              >
                <span className="relative block w-full h-full rounded-full overflow-hidden">
                  <Image src={slide.swatch} alt={slide.label || product.title} fill className="object-cover" />
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
  const pathname = usePathname();
  const [cookieLocale, setCookieLocale] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (match?.[1]) setCookieLocale(decodeURIComponent(match[1]));
  }, []);

  const localeFromPath = pathname?.match(/^\/(en)(?:\/|$)/)?.[1] ?? null;
  const pathLooksEnglish =
    pathname?.startsWith('/products') ||
    pathname?.startsWith('/solutions') ||
    pathname?.startsWith('/projects') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/contact');

  const isEnglishRoute = localeFromPath === 'en' || cookieLocale === 'en' || !!pathLooksEnglish;
  const englishPrefix = localeFromPath === 'en' ? '/en' : '';
  const shopHref = isEnglishRoute ? `${englishPrefix}/products` : '/produktai';

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 803:13029 ===== */}
      <div className="lg:hidden">
        {/* Title Section - Mobile */}
        <div className="px-[16px] pt-[64px] pb-[24px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            products
          </p>
          <p className="font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616] w-[358px]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic">perfect</span>
            <span> wood finish</span>
          </p>
        </div>

        {/* Horizontal scrolling product cards - Figma 803:13033 */}
        <div
          ref={scrollRef}
          className="flex gap-[8px] overflow-x-auto px-[16px] pb-[24px] scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, idx) => (
            <div key={idx} style={{ scrollSnapAlign: 'start' }}>
              <MobileProductCard product={product} />
            </div>
          ))}
        </div>

        {/* GET AN OFFER Button - Mobile */}
        <div className="px-[16px] pb-[64px]">
          <Link
            href={shopHref}
            className="w-[358px] max-w-full mx-auto block bg-[#161616] rounded-[100px] h-[48px] flex items-center justify-center"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              get an offer
            </span>
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] relative">
        {/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+14px)] */}
        <div className="relative h-[160px] text-[#161616] z-10">
          <p className="absolute font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase left-[0px] top-[23px]">
            products
          </p>
          <p className="absolute font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] left-[calc(25%+14px)] top-[0px] w-[692px]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">perfect</span>
            <span> wood finish</span>
          </p>
        </div>

        {/* Products Grid - full-width so card edges align with content edges */}
        <div className="mt-[58px] flex w-full justify-between gap-[40px]">
          {products.map((product, idx) => (
            <DesktopProductCard key={idx} product={product} />
          ))}
        </div>

        {/* View Catalog Button */}
        <div className="mt-[48px] flex justify-center">
          <Link
            href={shopHref}
            className="bg-[#161616] px-[40px] py-[10px] h-[48px] rounded-[100px] w-[296px] flex items-center justify-center gap-[10px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              view catalog
            </span>
          </Link>
        </div>

        <div className="pb-[64px]" />
      </div>
    </section>
  );
}
