'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import type { Product, ProductColorVariant, ProductProfileVariant } from '@/lib/products.supabase';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const t = useTranslations('productPage');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const hasSale =
    typeof product.salePrice === 'number' &&
    product.salePrice > 0 &&
    product.salePrice < product.price;
  const effectivePrice = hasSale ? product.salePrice! : product.price;

  const [show3D, setShow3D] = useState(false);
  const loading3D = false;
  const [expandedAccordion, setExpandedAccordion] = useState('aesthetics');

  const colorOptions = useMemo<ProductColorVariant[]>(() => {
    return (product.colors || []).map((color, index) => ({
      ...color,
      id: color.id || `${product.id}-color-${index}`,
      hex: color.hex || '#444444',
      priceModifier: color.priceModifier ?? 0,
    }));
  }, [product.colors, product.id]);

  const profileOptions = useMemo<ProductProfileVariant[]>(() => {
    return (product.profiles || []).map((profile, index) => {
      const dimensionLabel = [
        profile.dimensions?.width ? `${profile.dimensions.width} mm` : null,
        profile.dimensions?.thickness ? `× ${profile.dimensions.thickness} mm` : null,
        profile.dimensions?.length ? `× ${profile.dimensions.length} mm` : null,
      ]
        .filter(Boolean)
        .join(' ');

      const description = [dimensionLabel, profile.description]
        .filter(Boolean)
        .join(' • ');

      return {
        ...profile,
        id: profile.id || `${product.id}-profile-${index}`,
        description,
        priceModifier: profile.priceModifier ?? 0,
      };
    });
  }, [product.id, product.profiles]);

  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(colorOptions[0] || null);
  const [selectedFinish, setSelectedFinish] = useState<ProductProfileVariant | null>(profileOptions[0] || null);

  useEffect(() => {
    setSelectedColor(colorOptions[0] || null);
  }, [colorOptions]);

  useEffect(() => {
    setSelectedFinish(profileOptions[0] || null);
  }, [profileOptions]);

  const solutions = [
    { id: 'facade', label: t('solutions.facade') },
    { id: 'fence', label: t('solutions.fence') },
    { id: 'terrace', label: t('solutions.terrace') },
    { id: 'interior', label: t('solutions.interior') },
  ] as const;

  const woodTypes = [
    { id: 'spruce', label: t('woodTypes.spruce') },
    { id: 'larch', label: t('woodTypes.larch') },
  ] as const;

  const benefits = [
    {
      id: 'aesthetics',
      title: t('benefits.aesthetics.title'),
      content: t('benefits.aesthetics.content'),
    },
    {
      id: 'eco',
      title: t('benefits.eco.title'),
      content: t('benefits.eco.content'),
    },
    {
      id: 'durability',
      title: t('benefits.durability.title'),
      content: t('benefits.durability.content'),
    },
    {
      id: 'maintenance',
      title: t('benefits.maintenance.title'),
      content: t('benefits.maintenance.content'),
    },
  ] as const;

  const contactHref = {
    pathname: locale === 'en' ? '/contact' : '/kontaktai',
    query: {
      produktas: displayName,
      spalva: selectedColor?.name ?? '',
      profilis: selectedFinish?.name ?? '',
      sprendimas: product.category ?? '',
      perziura: show3D ? '3d' : 'foto',
    },
  };

  return (
    <div className="w-full bg-[#E1E1E1] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px] lg:py-[24px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-[16px] lg:gap-[24px]">
          {/* Media */}
          <div className="relative w-full h-[420px] lg:h-[729px] rounded-[8px] overflow-hidden bg-[#EAEAEA]">
            <button
              type="button"
              onClick={() => setShow3D((v) => !v)}
              className="absolute z-10 top-[16px] right-[16px] h-[32px] px-[12px] rounded-[100px] border border-[#BBBBBB] bg-white/90 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#161616]"
              aria-label={show3D ? t('toggleShowPhotoAria') : t('toggleShow3dAria')}
            >
              {show3D ? t('photo') : t('view3d')}
            </button>

            {show3D ? (
              <div className="absolute inset-0">
                <Konfiguratorius3D
                  productId={product.id}
                  availableColors={colorOptions}
                  availableFinishes={profileOptions}
                  selectedColorId={selectedColor?.id}
                  selectedFinishId={selectedFinish?.id}
                  isLoading={loading3D}
                  mode="viewport"
                  className="h-full"
                  canvasClassName="h-full"
                />
              </div>
            ) : (
              <Image
                src={product.images?.[0] ?? product.image}
                alt={displayName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-[16px] lg:gap-[20px]">
            <div className="flex items-center gap-[8px]">
              <Link
                href={toLocalePath('/products', currentLocale)}
                className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] hover:text-[#161616]"
              >
                ← {t('back')}
              </Link>
            </div>

            <div className="flex flex-col gap-[8px]">
              <h1 className="font-['DM_Sans'] text-[28px] lg:text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {displayName}
              </h1>

              <div className="flex items-baseline gap-[10px]">
                <p className="font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#535353] tracking-[-0.32px]">
                  {t('fromPrice', { price: effectivePrice.toFixed(0) })}
                </p>
                {hasSale ? (
                  <p className="font-['DM_Sans'] font-normal text-[14px] leading-[1.2] text-[#7C7C7C] tracking-[-0.28px] line-through">
                    {product.price.toFixed(0)} €
                  </p>
                ) : null}
              </div>
            </div>

            {/* Wood type */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-[8px] flex-wrap">
                {woodTypes.map((w) => {
                  const active = product.woodType ? product.woodType === w.id : false;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      className={`h-[24px] px-[10px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                        active ? 'bg-[#161616] border-[#161616] text-white' : 'bg-transparent border-[#BBBBBB] text-[#535353]'
                      }`}
                      aria-pressed={active}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solutions */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('solutionsLabel')}</p>
              <div className="flex gap-[8px] flex-wrap">
                {solutions.map((s) => {
                  const active = product.category === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`h-[24px] px-[10px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                        active ? 'bg-[#161616] border-[#161616] text-white' : 'bg-transparent border-[#BBBBBB] text-[#535353]'
                      }`}
                      aria-pressed={active}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] max-w-[434px]">
              {displayDescription || t('descriptionFallback')}
            </p>

            {/* Color Selector - New Figma Style */}
            {colorOptions.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
                  <span className="text-[#7C7C7C]">{t('colorLabelInline')}</span>
                  <span className="text-[#161616]">{selectedColor?.name || t('selectColorPlaceholder')}</span>
                </div>
                <div className="flex gap-[8px] flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-[18px] h-[18px] rounded-full overflow-hidden border border-[#BBBBBB] ${
                        selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                      }`}
                      title={color.name}
                    >
                      {color.image ? (
                        <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ backgroundColor: color.hex }} className="w-full h-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Finish Selector (if not in 3D mode) */}
            {profileOptions.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('profilesLabel')}</p>
                <div className="flex gap-[8px] flex-wrap">
                  {profileOptions.slice(0, 4).map((finish) => {
                    const active = selectedFinish?.id === finish.id;
                    return (
                      <button
                        key={finish.id}
                        type="button"
                        onClick={() => setSelectedFinish(finish)}
                        className={`h-[40px] w-[64px] rounded-[4px] border flex items-center justify-center transition-colors ${
                          active ? 'bg-[#161616] border-[#161616]' : 'bg-transparent border-[#BBBBBB]'
                        }`}
                        title={finish.name}
                        aria-pressed={active}
                      >
                        <svg width="46" height="12" viewBox="0 0 70 12" fill="none" className={active ? 'stroke-white' : 'stroke-[#161616]'}>
                          <path d="M0 11L35 0V11H70" strokeWidth="1.5" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('benefitsLabel')}</p>
              <div className="flex flex-col">
                {benefits.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <div className="h-[1px] bg-[#BBBBBB]" />}
                    <button
                      type="button"
                      onClick={() => setExpandedAccordion(expandedAccordion === item.id ? '' : item.id)}
                      className="flex items-center justify-between py-[10px]"
                    >
                      <span className="font-['Outfit'] font-medium text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                        {item.title}
                      </span>
                      <div className="w-[20px] h-[20px]">
                        {expandedAccordion === item.id ? (
                          <svg viewBox="0 0 20 20" fill="none">
                            <path d="M5 10H15" stroke="#161616" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="none">
                            <path d="M10 5V15M5 10H15" stroke="#161616" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                    {expandedAccordion === item.id && (
                      <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] pb-[10px] max-w-[494px]">
                        {item.content}
                      </p>
                    )}
                  </React.Fragment>
                ))}
                <div className="h-[1px] bg-[#BBBBBB]" />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-[8px] pt-[8px]">
              <Link
                href={contactHref}
                className="w-full bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center hover:bg-[#2d2d2d] transition-colors"
              >
                {t('ctaQuote')}
              </Link>
              <Link
                href={contactHref}
                className="w-full h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center border border-[#161616] text-[#161616] hover:bg-white transition-colors"
              >
                {t('ctaContact')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

