"use client";

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ProductColorVariant, ProductProfileVariant } from '@/lib/products.supabase';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart/store';

interface PlaceholderModelProps {
  color: string;
}

function PlaceholderModel({ color }: PlaceholderModelProps) {
  // Simple box until real GLTF is loaded
  return (
    <mesh>
      <boxGeometry args={[2, 0.2, 1]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

export interface Konfiguratorius3DProps {
  productId: string;
  availableColors: ProductColorVariant[];
  availableFinishes: ProductProfileVariant[];
  mode?: 'full' | 'viewport';
  selectedColorId?: string;
  selectedFinishId?: string;
  onColorChange?: (color: ProductColorVariant) => void;
  onFinishChange?: (finish: ProductProfileVariant) => void;
  className?: string;
  isLoading?: boolean;
  canvasClassName?: string;
}

export default function Konfiguratorius3D({ 
  productId,
  availableColors, 
  availableFinishes,
  mode = 'full',
  selectedColorId,
  selectedFinishId,
  onColorChange,
  onFinishChange,
  className = '',
  isLoading = false,
  canvasClassName,
}: Konfiguratorius3DProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(
    availableColors[0] || null
  );
  const [selectedFinish, setSelectedFinish] = useState<ProductProfileVariant | null>(
    availableFinishes[0] || null
  );
  const [modelColor, setModelColor] = useState('#444444');

  const [inputMode, setInputMode] = useState<'boards' | 'area'>('boards');
  const [quantityBoards, setQuantityBoards] = useState<number>(1);
  const [targetAreaM2, setTargetAreaM2] = useState<number>(1);

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quote, setQuote] = useState<null | {
    unitPricePerM2: number;
    areaM2: number;
    totalAreaM2: number;
    unitPricePerBoard: number;
    quantityBoards: number;
    lineTotal: number;
    inputMode: 'boards' | 'area';
    roundingInfo?: {
      requestedAreaM2: number;
      actualAreaM2: number;
      deltaAreaM2: number;
      rounding: 'ceil' | 'round' | 'floor';
    };
  }>(null);

  const cartItems = useCartStore((state) => state.items);

  const cartTotalAreaM2 = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const a = item.pricingSnapshot?.totalAreaM2;
      if (typeof a === 'number' && Number.isFinite(a) && a > 0) return sum + a;
      return sum;
    }, 0);
  }, [cartItems]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const numberM2 = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    [locale]
  );

  useEffect(() => {
    if (!selectedColorId) return;
    const next = availableColors.find((c) => c.id === selectedColorId) ?? null;
    setSelectedColor(next);
  }, [availableColors, selectedColorId, productId]);

  useEffect(() => {
    if (!selectedFinishId) return;
    const next = availableFinishes.find((f) => f.id === selectedFinishId) ?? null;
    setSelectedFinish(next);
  }, [availableFinishes, selectedFinishId, productId]);

  useEffect(() => {
    if (selectedColor?.hex) {
      setModelColor(selectedColor.hex);
    }
  }, [selectedColor]);

  // Realtime price quote for current configuration.
  useEffect(() => {
    const widthMm = selectedFinish?.dimensions?.width;
    const lengthMm = selectedFinish?.dimensions?.length;

    if (!productId) return;
    if (typeof widthMm !== 'number' || typeof lengthMm !== 'number') {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        type QuoteRequestBody = {
          productId: string;
          profileVariantId?: string;
          colorVariantId?: string;
          widthMm: number;
          lengthMm: number;
          inputMode: 'boards' | 'area';
          quantityBoards?: number;
          targetAreaM2?: number;
          rounding?: 'ceil' | 'round' | 'floor';
          cartTotalAreaM2?: number;
        };

        const unitAreaM2 =
          typeof widthMm === 'number' && typeof lengthMm === 'number'
            ? (widthMm / 1000) * (lengthMm / 1000)
            : 0;

        const currentLineAreaM2 =
          inputMode === 'boards'
            ? (typeof quantityBoards === 'number' ? quantityBoards : 0) * unitAreaM2
            : typeof targetAreaM2 === 'number' && unitAreaM2 > 0
              ? Math.ceil(targetAreaM2 / unitAreaM2) * unitAreaM2
              : 0;

        const body: QuoteRequestBody =
          inputMode === 'boards'
            ? {
                productId,
                profileVariantId: selectedFinish?.id,
                colorVariantId: selectedColor?.id,
                widthMm,
                lengthMm,
                inputMode,
                quantityBoards,
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
              }
            : {
                productId,
                profileVariantId: selectedFinish?.id,
                colorVariantId: selectedColor?.id,
                widthMm,
                lengthMm,
                inputMode,
                targetAreaM2,
                rounding: 'ceil',
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
              };

        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setQuote(null);
          try {
            const data = await res.json();
            setQuoteError(typeof data?.error === 'string' ? data.error : t('configurator.priceNotAvailable'));
          } catch {
            setQuoteError(t('configurator.priceNotAvailable'));
          }
          return;
        }

        const data: any = await res.json();

        const next = {
          unitPricePerM2: Number(data?.unitPricePerM2),
          areaM2: Number(data?.areaM2),
          totalAreaM2: Number(data?.totalAreaM2),
          unitPricePerBoard: Number(data?.unitPricePerBoard),
          quantityBoards: Number(data?.quantityBoards),
          lineTotal: Number(data?.lineTotal),
          inputMode: data?.inputMode === 'area' ? 'area' : 'boards',
          roundingInfo: data?.roundingInfo as
            | {
                requestedAreaM2: number;
                actualAreaM2: number;
                deltaAreaM2: number;
                rounding: 'ceil' | 'round' | 'floor';
              }
            | undefined,
        } as const;

        if (!Number.isFinite(next.unitPricePerM2) || next.unitPricePerM2 <= 0) {
          setQuote(null);
          setQuoteError(t('configurator.priceNotAvailable'));
          return;
        }

        setQuote(next);
        setQuoteError(null);

        // Keep UI values in sync with server-resolved quantity.
        if (inputMode === 'boards') {
          if (Number.isFinite(next.quantityBoards) && next.quantityBoards > 0 && next.quantityBoards !== quantityBoards) {
            setQuantityBoards(next.quantityBoards);
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setQuote(null);
        setQuoteError(t('configurator.priceNotAvailable'));
      } finally {
        setQuoteLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [productId, selectedFinish?.id, selectedFinish?.dimensions?.width, selectedFinish?.dimensions?.length, selectedColor?.id, inputMode, quantityBoards, targetAreaM2, cartTotalAreaM2, t]);

  const handleColorSelect = (color: ProductColorVariant) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  const handleFinishSelect = (finish: ProductProfileVariant) => {
    setSelectedFinish(finish);
    onFinishChange?.(finish);
  };

  return (
    <div className={mode === 'viewport' ? `w-full h-full ${className}` : `w-full flex flex-col gap-6 ${className}`}>
      {/* 3D Canvas */}
      <div
        className={`relative w-full border border-[#BBBBBB] rounded-[24px] overflow-hidden bg-[#EAEAEA] ${
          canvasClassName ?? (mode === 'viewport' ? 'h-full' : 'h-[400px] md:h-[500px]')
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EAEAEA] z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#BBBBBB] border-t-[#161616] rounded-full animate-spin" />
              <p className="font-['Outfit'] text-sm text-[#7C7C7C]">{t('configurator.loadingModel')}</p>
            </div>
          </div>
        )}
        
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <PlaceholderModel color={modelColor} />
          </Suspense>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>

        {mode === 'full' && (
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-xs font-['Outfit'] text-[#535353]">
            {t('configurator.controlsHint')}
          </div>
        )}
      </div>

      {mode === 'full' && (
        <>
          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
                {t('configurator.colorLabel')}
                {selectedColor && (
                  <span className="ml-2 font-['Outfit'] font-normal text-[#7C7C7C]">
                    ({selectedColor.name})
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => {
                  const priceModifier = color.priceModifier ?? 0;

                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color)}
                      className={`relative group ${
                        selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                      }`}
                      aria-label={t('configurator.selectColorAria', { name: color.name })}
                      title={color.name}
                    >
                    {color.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors">
                        <img 
                          src={color.image} 
                          alt={color.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="w-12 h-12 rounded-lg border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors"
                      />
                    )}
                    
                    {priceModifier !== 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#161616] text-white text-[10px] px-1.5 py-0.5 rounded-full font-['Outfit']">
                        {priceModifier > 0 ? '+' : ''}€{priceModifier.toFixed(0)}
                      </span>
                    )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Finish Selector */}
          {availableFinishes.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
                {t('configurator.profileLabel')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableFinishes.map((finish) => {
                  const priceModifier = finish.priceModifier ?? 0;

                  return (
                    <label
                      key={finish.id}
                      className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFinish?.id === finish.id
                          ? 'border-[#161616] bg-[#F9F9F9]'
                          : 'border-[#EAEAEA] hover:border-[#BBBBBB]'
                      }`}
                    >
                    <input
                      type="radio"
                      name="finish"
                      value={finish.id}
                      checked={selectedFinish?.id === finish.id}
                      onChange={() => handleFinishSelect(finish)}
                      className="mt-0.5 w-4 h-4 text-[#161616] focus:ring-[#161616]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-['DM_Sans'] font-medium text-[#161616]">
                          {finish.name}
                        </span>
                        {priceModifier !== 0 && (
                          <span className="font-['Outfit'] text-sm text-[#535353]">
                            {priceModifier > 0 ? '+' : ''}€{priceModifier.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {finish.description && (
                        <p className="mt-1 font-['Outfit'] text-xs text-[#7C7C7C]">
                          {finish.description}
                        </p>
                      )}
                    </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="p-4 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA]">
            <p className="font-['Outfit'] text-xs text-[#535353]">
              <strong>{t('configurator.noteTitle')}</strong> {t('configurator.noteBody')}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-white rounded-lg border border-[#EAEAEA]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-['DM_Sans'] text-sm font-medium text-[#161616]">{t('configurator.pricingTitle')}</h3>

              <div className="flex items-center gap-2">
                <span className="font-['Outfit'] text-xs text-[#7C7C7C]">{t('configurator.inputModeLabel')}</span>
                <div className="flex rounded-[100px] border border-[#BBBBBB] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('boards');
                      if (quote?.quantityBoards) setQuantityBoards(quote.quantityBoards);
                    }}
                    className={`h-[28px] px-3 font-['Outfit'] text-[12px] ${
                      inputMode === 'boards' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616]'
                    }`}
                  >
                    {t('configurator.inputModeBoards')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('area');
                      if (quote?.totalAreaM2) setTargetAreaM2(Number(quote.totalAreaM2.toFixed(2)));
                    }}
                    className={`h-[28px] px-3 font-['Outfit'] text-[12px] ${
                      inputMode === 'area' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616]'
                    }`}
                  >
                    {t('configurator.inputModeArea')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3">
              {inputMode === 'boards' ? (
                <label className="block">
                  <span className="block font-['Outfit'] text-xs text-[#535353] mb-1">{t('configurator.quantityBoardsLabel')}</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={quantityBoards}
                    onChange={(e) => setQuantityBoards(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                    className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="block font-['Outfit'] text-xs text-[#535353] mb-1">{t('configurator.targetAreaLabel')}</span>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={targetAreaM2}
                    onChange={(e) => setTargetAreaM2(Math.max(0.01, Number(e.target.value) || 0.01))}
                    className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </label>
              )}
            </div>

            {quoteLoading && (
              <p className="mt-3 font-['Outfit'] text-xs text-[#7C7C7C]">{t('configurator.calculatingPrice')}</p>
            )}

            {quoteError && !quoteLoading && (
              <p className="mt-3 font-['Outfit'] text-xs text-[#7C7C7C]">{quoteError}</p>
            )}

            {quote && !quoteLoading && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quote.roundingInfo && quote.roundingInfo.deltaAreaM2 > 0.000001 && (
                  <div className="sm:col-span-2">
                    <p className="font-['Outfit'] text-xs text-[#7C7C7C]">
                      ~{' '}
                      {t('configurator.roundingNotice', {
                        boards: String(quote.quantityBoards),
                        actualArea: numberM2.format(quote.roundingInfo.actualAreaM2),
                      })}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.unitPricePerM2Label')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.unitPricePerM2)}</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.unitPricePerBoardLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.unitPricePerBoard)}</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.totalAreaLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{numberM2.format(quote.totalAreaM2)} m²</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.lineTotalLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.lineTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
