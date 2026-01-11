'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart/store';
import { toLocalePath } from '@/i18n/paths';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const subtotal = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

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
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.finish}`} className="flex gap-[16px] pb-[16px] border-b border-[#BBBBBB]">
                      {/* Image */}
                      <div className="w-[111px] h-[125px] rounded-[8px] bg-white overflow-hidden shrink-0">
                        {/* Placeholder - replace with actual product image */}
                        <div className="w-full h-full bg-gradient-to-br from-[#BBBBBB] to-[#E1E1E1]" />
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
                                  Color: {item.color}
                                </p>
                              )}
                              {item.finish && (
                                <p className="font-['Outfit'] font-light text-[14px] leading-[1.3] text-[#161616]">
                                  Finish: {item.finish}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="font-['DM_Sans'] font-light text-[20px] leading-[1.1] tracking-[-0.8px] text-[#161616]">
                            {item.basePrice * item.quantity} €
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-[8px]">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8H13" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3V13M3 8H13" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-[8px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#535353] hover:text-[#161616] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    {subtotal.toFixed(2)} €
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    {t('cart.shipping')}
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {shipping === 0 ? 'Free' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#BBBBBB]" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                    {t('cart.total')}
                  </span>
                  <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                    {total.toFixed(2)} €
                  </span>
                </div>

                <p className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                  Including VAT
                </p>

                {/* Actions */}
                <div className="flex gap-[8px]">
                  <Link
                    href={productsHref}
                    onClick={onClose}
                    className="block w-full h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors flex items-center justify-center"
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
