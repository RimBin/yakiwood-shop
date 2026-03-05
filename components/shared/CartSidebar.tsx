'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore, type CartItem } from '@/lib/cart/store';
import { toLocalePath } from '@/i18n/paths';

const PROFILE_LABELS_LT: Record<string, string> = {
  'half-taper': 'Pusė špunto',
  'half-taper-45': 'Pusė špunto 45°',
  rectangle: 'Stačiakampis',
  rhombus: 'Rombas',
};

const normalizeProfileToken = (value: string) => {
  const token = value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!token) return '';
  const isHalf = token.includes('half') || token.includes('taper') || token.includes('pus') || token.includes('spunto');
  if (isHalf && token.includes('45')) return 'half-taper-45';
  if (isHalf) return 'half-taper';
  if (token.includes('rhomb') || token.includes('romb')) return 'rhombus';
  if (token.includes('rectangle') || token.includes('staciakamp')) return 'rectangle';
  return token;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function resolveWoodToken(name?: string): 'larch' | 'spruce' | null {
  const token = normalizeToken(name ?? '');
  if (!token) return null;
  if (token.includes('maumed') || token.includes('larch')) return 'larch';
  if (token.includes('egle') || token.includes('spruce')) return 'spruce';
  return null;
}

function resolveColorSlug(color?: string): string | null {
  const token = normalizeToken(color ?? '');
  if (!token) return null;
  if (token.includes('black') || token.includes('juod')) return 'black';
  if (token.includes('carbon-light') || token.includes('carbonlight') || token.includes('sviesi-angl')) return 'carbon-light';
  if (token.includes('carbon') || token.includes('angl')) return 'carbon';
  if (token.includes('graphite') || token.includes('grafit')) return 'graphite';
  if (token.includes('natural') || token.includes('natur')) return 'natural';
  if (token.includes('dark-brown') || token.includes('darkbrown') || token.includes('tams') || token.includes('ruda')) return 'dark-brown';
  if (token.includes('latte')) return 'latte';
  if (token.includes('silver') || token.includes('sidabr')) return 'silver';
  return null;
}

function resolveCartItemImage(item: CartItem): string | undefined {
  const woodToken = resolveWoodToken(item.name);
  const colorSlug = resolveColorSlug(item.color);

  if (woodToken && colorSlug) {
    return `/assets/finishes/${woodToken}/shou-sugi-ban-${woodToken}-${colorSlug}-facade-terrace-cladding.webp`;
  }

  return typeof item.image === 'string' && item.image.trim().length > 0 ? item.image : undefined;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const VAT_RATE = 0.21;

  const [draftQuantities, setDraftQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftQuantities((prev) => {
      const next: Record<string, string> = {};
      for (const item of items) {
        if (prev[item.lineId] !== undefined) next[item.lineId] = prev[item.lineId];
      }
      return next;
    });
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;
  const roundedTotal = Math.round(total);
  const totalNet = total > 0 ? total / (1 + VAT_RATE) : 0;
  const totalVat = total - totalNet;

  const formatPrice = (value: number) => {
    const rounded = Math.round(value);
    const numberLocale = currentLocale === 'lt' ? 'lt-LT' : 'en-US';
    return new Intl.NumberFormat(numberLocale).format(rounded);
  };

  const formatFinishLabel = (finish?: string) => {
    if (!finish) return finish;
    if (currentLocale !== 'lt') return finish;
    const token = normalizeProfileToken(finish);
    return PROFILE_LABELS_LT[token] ?? finish;
  };

  const quantityUnitLabel = currentLocale === 'lt' ? 'vnt' : 'pcs';

  const productsHref = toLocalePath('/products', currentLocale);
  const checkoutHref = toLocalePath('/checkout', currentLocale);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[552px] bg-[#E1E1E1] z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-[24px] py-[24px] flex items-center justify-between border-b border-[#BBBBBB]">
            <h2 className="font-['DM_Sans'] font-light text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
              {t('cart.yourCart')} ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label={t('cart.closeCart')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center px-[24px] py-[40px]">
              <h3 className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616] mb-[24px] text-center">
                {t('cart.emptyCart')}
              </h3>
              <Link
                href={productsHref}
                onClick={onClose}
                className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors flex items-center justify-center"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">
                <div className="space-y-[16px]">
                  {items.map((item) => {
                    const previewImage = resolveCartItemImage(item);

                    return (
                    <div key={item.addedAt ?? item.lineId} className="flex gap-[16px] pb-[16px] border-b border-[#BBBBBB]">
                      {/* Image */}
                      <div className="w-[111px] h-[125px] rounded-[8px] bg-[#EAEAEA] overflow-hidden shrink-0">
                        {typeof previewImage === 'string' ? (
                          <img
                            src={previewImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#BBBBBB] to-[#E1E1E1]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-['DM_Sans'] font-light text-[20px] leading-[1.1] tracking-[-0.8px] text-[#161616] mb-[8px]">
                            {item.name}
                          </h3>
                          {(item.color || item.finish) && (
                            <div className="space-y-[4px]">
                              {item.color && (
                                <p className="font-['Outfit'] font-light text-[14px] leading-[1.3] text-[#161616]">
                                  {t('cart.color')} {item.color}
                                </p>
                              )}
                              {item.finish && (
                                <p className="font-['Outfit'] font-light text-[14px] leading-[1.3] text-[#161616]">
                                  {t('cart.finish')} {formatFinishLabel(item.finish)}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-[10px]">
                            <p className="font-['Outfit'] font-light text-[12px] leading-[1.4] text-[#535353]">
                              {t('cart.dimensions')}
                            </p>
                            {typeof item.configuration?.widthMm === 'number' && typeof item.configuration?.lengthMm === 'number' ? (
                              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.4] text-[#161616]">
                                L{item.configuration.lengthMm}mm x W{item.configuration.widthMm}mm
                              </p>
                            ) : (
                              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.4] text-[#535353]">
                                {t('cart.dimensionsNotSet')}
                              </p>
                            )}
                            {typeof item.configuration?.widthMm === 'number' && typeof item.configuration?.lengthMm === 'number' ? (
                              <p className="mt-[2px] font-['Outfit'] font-normal text-[12px] leading-[1.4] text-[#535353]">
                                {t('cart.boardArea') ?? 'Vienos lentos plotas'}:{' '}
                                {((item.configuration.widthMm / 1000) * (item.configuration.lengthMm / 1000)).toFixed(3)} m²
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="font-['DM_Sans'] font-light text-[20px] leading-[1.1] tracking-[-0.8px] text-[#161616]">
                            {formatPrice(
                              typeof item.pricingSnapshot?.lineTotal === 'number'
                                ? item.pricingSnapshot.lineTotal
                                : item.basePrice * item.quantity
                            )} €
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-[8px]">
                            <button
                              onClick={() => {
                                const isArea = item.inputMode === 'area';
                                const step = isArea ? 0.1 : 1;
                                const min = isArea ? 0.1 : 1;
                                const next = isArea
                                  ? Math.max(min, Math.round((item.quantity - step) * 10) / 10)
                                  : Math.max(min, item.quantity - step);
                                updateQuantity(item.lineId, next);
                              }}
                              className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8H13" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>

                            {(() => {
                              const isArea = item.inputMode === 'area';
                              const unit = isArea ? 'm²' : quantityUnitLabel;
                              const step = isArea ? 0.1 : 1;
                              const min = isArea ? 0.1 : 1;
                              const draft = draftQuantities[item.lineId];
                              const value =
                                draft !== undefined
                                  ? draft
                                  : isArea
                                    ? Number(item.quantity).toFixed(1)
                                    : String(item.quantity);

                              const commit = (raw: string) => {
                                const trimmed = raw.trim();
                                if (!trimmed) {
                                  setDraftQuantities((prev) => {
                                    const { [item.lineId]: _, ...rest } = prev;
                                    return rest;
                                  });
                                  return;
                                }

                                const parsed = isArea ? Number.parseFloat(trimmed) : Number.parseInt(trimmed, 10);
                                if (!Number.isFinite(parsed)) return;

                                const nextQuantity = isArea
                                  ? Math.max(min, Math.round(parsed * 10) / 10)
                                  : Math.max(min, Math.round(parsed));
                                updateQuantity(item.lineId, nextQuantity);
                                setDraftQuantities((prev) => {
                                  const { [item.lineId]: _, ...rest } = prev;
                                  return rest;
                                });
                              };

                              return (
                                <div className="min-w-[56px] flex items-center justify-center gap-[6px] whitespace-nowrap">
                                  <input
                                    inputMode="decimal"
                                    type="number"
                                    min={min}
                                    step={step}
                                    value={value}
                                    onFocus={() => {
                                      setDraftQuantities((prev) => ({
                                        ...prev,
                                        [item.lineId]: isArea ? Number(item.quantity).toFixed(1) : String(item.quantity),
                                      }));
                                    }}
                                    onChange={(e) => {
                                      const next = e.currentTarget.value;
                                      setDraftQuantities((prev) => ({ ...prev, [item.lineId]: next }));
                                    }}
                                    onBlur={(e) => commit(e.currentTarget.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        (e.currentTarget as HTMLInputElement).blur();
                                      }
                                    }}
                                    className="w-[52px] h-[28px] rounded-[6px] border border-[#BBBBBB] bg-[#EAEAEA] px-[8px] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] text-center"
                                    aria-label={t('cart.quantity') ?? 'Quantity'}
                                  />
                                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                                    {unit}
                                  </span>
                                </div>
                              );
                            })()}

                            <button
                              onClick={() => {
                                const isArea = item.inputMode === 'area';
                                const step = isArea ? 0.1 : 1;
                                const next = isArea
                                  ? Math.round((item.quantity + step) * 10) / 10
                                  : item.quantity + step;
                                updateQuantity(item.lineId, next);
                              }}
                              className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3V13M3 8H13" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => removeItem(item.lineId)}
                              className="ml-[8px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#535353] hover:text-[#161616] transition-colors"
                            >
                              {t('cart.remove')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="px-[24px] py-[24px] border-t border-[#BBBBBB] space-y-[16px]">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    {t('cart.subtotal')}
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {formatPrice(subtotal)} €
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    {t('cart.shipping')}
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {shipping === 0 ? t('cart.free') : `${formatPrice(shipping)} €`}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#BBBBBB]" />

                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    {t('cart.subtotalExVat')}
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {formatPrice(totalNet)} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    {t('cart.vatAmount', { rate: Math.round(VAT_RATE * 100) })}
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {formatPrice(totalVat)} €
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                    {t('cart.total')}
                  </span>
                  <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                    {formatPrice(roundedTotal)} €
                  </span>
                </div>

                <p className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                  {t('cart.includingVat')}
                </p>

                {/* Actions */}
                <div className="flex gap-[8px]">
                  <Link
                    href={productsHref}
                    onClick={onClose}
                    className="block w-full h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors flex items-center justify-center"
                  >
                    {t('cart.continueShopping')}
                  </Link>
                  <Link
                    href={checkoutHref}
                    onClick={onClose}
                    className="block w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors flex items-center justify-center"
                  >
                    {t('cart.checkout')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
