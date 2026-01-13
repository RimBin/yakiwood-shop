'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import type { Product, ProductColorVariant, ProductProfileVariant } from '@/lib/products.supabase';
import { useCartStore } from '@/lib/cart/store';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import type { UsageType } from '@/lib/pricing/configuration';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const t = useTranslations('productPage');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const widthOptionsMm = useMemo(() => [95, 120, 145] as const, []);
  const lengthOptionsMm = useMemo(() => [3000, 3300, 3600] as const, []);

  const cartTotalAreaM2 = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const a = item.pricingSnapshot?.totalAreaM2;
      if (typeof a === 'number' && Number.isFinite(a) && a > 0) return sum + a;
      return sum;
    }, 0);
  }, [cartItems]);

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

  const [selectedWidthMm, setSelectedWidthMm] = useState<number>(() => widthOptionsMm[0]);
  const [selectedLengthMm, setSelectedLengthMm] = useState<number>(() => lengthOptionsMm[0]);

  const usageTypeForQuote: UsageType | undefined = useMemo(() => {
    const v = String(product.category || '').toLowerCase();
    if (v === 'facade' || v === 'terrace' || v === 'interior' || v === 'fence') return v;
    return undefined;
  }, [product.category]);

  const [selectedThicknessMm, setSelectedThicknessMm] = useState<number>(() => {
    return usageTypeForQuote === 'terrace' ? 28 : 20;
  });

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotedPricing, setQuotedPricing] = useState<null | {
    unitPricePerBoard: number;
    unitPricePerM2: number;
    unitAreaM2: number;
  }>(null);

  useEffect(() => {
    setSelectedColor(colorOptions[0] || null);
  }, [colorOptions]);

  useEffect(() => {
    setSelectedFinish(profileOptions[0] || null);
  }, [profileOptions]);

  const thicknessOptions = useMemo(() => {
    const all = [
      { valueMm: 20, label: '18/20 mm' },
      { valueMm: 28, label: '28 mm' },
    ];

    if (usageTypeForQuote === 'terrace') return all.filter((x) => x.valueMm === 28);
    if (usageTypeForQuote === 'facade') return all.filter((x) => x.valueMm === 20);
    return all;
  }, [usageTypeForQuote]);

  useEffect(() => {
    const allowed = new Set(thicknessOptions.map((x) => x.valueMm));
    if (!allowed.has(selectedThicknessMm)) {
      setSelectedThicknessMm(thicknessOptions[0]?.valueMm ?? 20);
    }
  }, [selectedThicknessMm, thicknessOptions]);

  const selectedThicknessLabel = useMemo(() => {
    return thicknessOptions.find((opt) => opt.valueMm === selectedThicknessMm)?.label ?? `${selectedThicknessMm} mm`;
  }, [selectedThicknessMm, thicknessOptions]);

  const selectionPrice = useMemo(() => {
    const colorMod = selectedColor?.priceModifier ?? 0;
    const finishMod = selectedFinish?.priceModifier ?? 0;
    return effectivePrice + colorMod + finishMod;
  }, [effectivePrice, selectedColor?.priceModifier, selectedFinish?.priceModifier]);

  const handleAddToCart = () => {
    const unitPricePerBoard = quotedPricing?.unitPricePerBoard;
    const unitPricePerM2 = quotedPricing?.unitPricePerM2;
    const unitAreaM2 = quotedPricing?.unitAreaM2;

    addItem({
      id: product.id,
      name: displayName,
      slug: product.slug,
      basePrice: typeof unitPricePerBoard === 'number' ? unitPricePerBoard : selectionPrice,
      color: selectedColor?.name,
      finish: selectedFinish?.name,
      configuration: {
        usageType: usageTypeForQuote,
        colorVariantId: selectedColor?.id,
        profileVariantId: selectedFinish?.id,
        thicknessMm: selectedThicknessMm,
        widthMm: selectedWidthMm,
        lengthMm: selectedLengthMm,
      },
      inputMode: 'boards',
      pricingSnapshot:
        typeof unitPricePerBoard === 'number' &&
        typeof unitPricePerM2 === 'number' &&
        typeof unitAreaM2 === 'number'
          ? {
              unitAreaM2,
              totalAreaM2: unitAreaM2 * 1,
              pricePerM2Used: unitPricePerM2,
              unitPrice: unitPricePerBoard,
              lineTotal: unitPricePerBoard * 1,
            }
          : undefined,
    });
  };

  useEffect(() => {
    const widthMm = selectedWidthMm;
    const lengthMm = selectedLengthMm;
    const unitAreaM2ForThreshold =
      typeof widthMm === 'number' && typeof lengthMm === 'number' ? (widthMm / 1000) * (lengthMm / 1000) : 0;

    if (!product?.id) return;

    const controller = new AbortController();

    const run = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            productId: product.id,
            usageType: usageTypeForQuote,
            profileVariantId: selectedFinish?.id,
            colorVariantId: selectedColor?.id,
            thicknessMm: selectedThicknessMm,
            widthMm,
            lengthMm,
            inputMode: 'boards',
            quantityBoards: 1,
            cartTotalAreaM2: cartTotalAreaM2 + unitAreaM2ForThreshold,
          }),
        });

        if (!res.ok) {
          setQuotedPricing(null);
          try {
            const data = await res.json();
            setQuoteError(typeof data?.error === 'string' ? data.error : null);
          } catch {
            setQuoteError(null);
          }
          return;
        }

        const data = await res.json();
        const unitPricePerBoard = Number(data?.unitPricePerBoard);
        const unitPricePerM2 = Number(data?.unitPricePerM2);
        const quotedUnitAreaM2 = Number(data?.areaM2);

        if (
          Number.isFinite(unitPricePerBoard) &&
          unitPricePerBoard > 0 &&
          Number.isFinite(unitPricePerM2) &&
          unitPricePerM2 > 0 &&
          Number.isFinite(quotedUnitAreaM2) &&
          quotedUnitAreaM2 > 0
        ) {
          setQuotedPricing({ unitPricePerBoard, unitPricePerM2, unitAreaM2: quotedUnitAreaM2 });
        } else {
          setQuotedPricing(null);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setQuotedPricing(null);
        setQuoteError(currentLocale === 'lt' ? 'Nepavyko apskaičiuoti kainos' : 'Failed to calculate price');
      } finally {
        setQuoteLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [product?.id, usageTypeForQuote, selectedFinish?.id, selectedColor?.id, selectedThicknessMm, selectedWidthMm, selectedLengthMm, cartTotalAreaM2, currentLocale]);

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
      storis: selectedThicknessLabel,
      plotis: String(selectedWidthMm),
      ilgis: String(selectedLengthMm),
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

              {quoteLoading ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                  {currentLocale === 'lt' ? 'Skaičiuojama kaina…' : 'Calculating price…'}
                </p>
              ) : typeof quotedPricing?.unitPricePerBoard === 'number' ? (
                <p className="font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#161616] tracking-[-0.32px]">
                  {currentLocale === 'lt' ? 'Pasirinkimo kaina:' : 'Selected price:'}{' '}
                  {quotedPricing.unitPricePerBoard.toFixed(2)} €
                </p>
              ) : quoteError ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">{quoteError}</p>
              ) : null}
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

            {/* Thickness */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('thicknessLabel')}</p>
              <div className="flex gap-[8px] flex-wrap">
                {thicknessOptions.map((opt) => {
                  const active = selectedThicknessMm === opt.valueMm;
                  return (
                    <button
                      key={opt.valueMm}
                      type="button"
                      onClick={() => setSelectedThicknessMm(opt.valueMm)}
                      className={`h-[24px] px-[10px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                        active
                          ? 'bg-[#161616] border-[#161616] text-white'
                          : 'bg-transparent border-[#BBBBBB] text-[#535353]'
                      }`}
                      aria-pressed={active}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Width */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('widthLabel')}</p>
              <div className="flex gap-[8px] flex-wrap">
                {widthOptionsMm.map((valueMm) => {
                  const active = selectedWidthMm === valueMm;
                  return (
                    <button
                      key={valueMm}
                      type="button"
                      onClick={() => setSelectedWidthMm(valueMm)}
                      className={`h-[24px] px-[10px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                        active
                          ? 'bg-[#161616] border-[#161616] text-white'
                          : 'bg-transparent border-[#BBBBBB] text-[#535353]'
                      }`}
                      aria-pressed={active}
                    >
                      {valueMm} mm
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t('lengthLabel')}</p>
              <div className="flex gap-[8px] flex-wrap">
                {lengthOptionsMm.map((valueMm) => {
                  const active = selectedLengthMm === valueMm;
                  return (
                    <button
                      key={valueMm}
                      type="button"
                      onClick={() => setSelectedLengthMm(valueMm)}
                      className={`h-[24px] px-[10px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                        active
                          ? 'bg-[#161616] border-[#161616] text-white'
                          : 'bg-transparent border-[#BBBBBB] text-[#535353]'
                      }`}
                      aria-pressed={active}
                    >
                      {valueMm} mm
                    </button>
                  );
                })}
              </div>
            </div>

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
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center hover:bg-[#2d2d2d] transition-colors"
              >
                {currentLocale === 'lt' ? 'Į krepšelį' : 'Add to cart'}
              </button>
              <Link
                href={contactHref}
                className="w-full bg-white text-[#161616] h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center border border-[#161616] hover:bg-white transition-colors"
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

