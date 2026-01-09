'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart/store';
import ModalOverlay from '@/components/modals/ModalOverlay';
import LoginModal from '@/components/modals/LoginModal';
import RegisterModal from '@/components/modals/RegisterModal';
import SuccessModal from '@/components/modals/SuccessModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
import Link from 'next/link';
import { seedProducts } from '@/data/seed-products';
import { useLocale, useTranslations } from 'next-intl';

function formatMoney(value: number, locale: string): string {
  const rounded = Math.round(value);
  const numberLocale = locale === 'en' ? 'en-US' : 'lt-LT';
  return `${new Intl.NumberFormat(numberLocale).format(rounded)} €`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-['Outfit'] font-normal leading-[1.3] text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase w-full whitespace-pre-wrap">
      {children}
    </p>
  );
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'border border-[#BBBBBB] border-solid',
        'bg-transparent',
        'h-[48px] w-full px-[16px]',
        "font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]",
        'outline-none focus:border-[#161616]',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

function TextAreaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        'border border-[#BBBBBB] border-solid',
        'bg-transparent',
        'w-full px-[16px] py-[16px]',
        "font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]",
        'outline-none focus:border-[#161616] resize-none',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

function FigmaCheckbox({
  checked,
  onChange,
  label,
  id,
  required,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode | React.ComponentType;
  id: string;
  required?: boolean;
}) {
  const renderedLabel =
    typeof label === 'function' ? React.createElement(label as React.ComponentType) : label;

  return (
    <label htmlFor={id} className="flex items-center gap-[4px]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className={[
          'appearance-none',
          'relative',
          'size-[16.5px]',
          'border border-[#161616] border-solid',
          'checked:bg-[#161616]',
          "after:content-['']",
          'after:absolute',
          'after:left-[5px] after:top-[1px]',
          'after:w-[5px] after:h-[9px]',
          'after:border-r-2 after:border-b-2 after:border-white',
          'after:rotate-45',
          'after:opacity-0 checked:after:opacity-100',
        ].join(' ')}
      />
      <span className="font-['Outfit'] font-light leading-[1.2] text-[#535353] text-[14px] tracking-[0.14px]">
        {renderedLabel}
      </span>
    </label>
  );
}

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations('checkout');

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Contact Information
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Delivery Information
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliverDifferentAddress, setDeliverDifferentAddress] = useState(false);

  // UI-only: payment + coupon
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cards' | 'paypal'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Payment Method
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const productItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        basePrice: item.basePrice,
        quantity: item.quantity,
        color: item.color,
        finish: item.finish,
      }));

      // 1) Always create order first (WooCommerce-like)
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: productItems,
          customer: {
            email,
            name: fullName,
            phone,
            address,
            city,
            postalCode,
            country,
          },
          deliveryNotes,
          couponCode: couponCode?.trim() ? couponCode.trim() : undefined,
          paymentProvider: paymentMethod === 'paypal' ? 'paypal' : 'stripe',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || t('errors.orderCreateFailed'));
      }

      const orderId = orderData?.order?.id as string | undefined;
      const orderNumber = orderData?.order?.orderNumber as string | undefined;

      if (!orderId) {
        throw new Error(t('errors.orderIdMissing'));
      }

      // 2) If Stripe/cards selected, create Stripe Checkout Session and redirect
      if (paymentMethod === 'stripe' || paymentMethod === 'cards') {
        const itemsForPayment = shipping > 0
          ? [
              ...productItems,
              {
                id: 'shipping',
                name: t('summary.shipping'),
                slug: 'shipping',
                basePrice: shipping,
                quantity: 1,
              },
            ]
          : productItems;

        const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items: itemsForPayment,
          customer: {
            email,
            name: fullName,
            phone,
            address,
            city,
            postalCode,
            country
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.paymentSessionFailed'));
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t('errors.paymentUrlMissing'));
      }

        return;
      }

      // 2b) PayPal: create PayPal checkout and redirect
      if (paymentMethod === 'paypal') {
        const itemsForPayment = shipping > 0
          ? [
              ...productItems,
              {
                id: 'shipping',
                name: t('summary.shipping'),
                slug: 'shipping',
                basePrice: shipping,
                quantity: 1,
              },
            ]
          : productItems;

        const response = await fetch('/api/paypal/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            items: itemsForPayment,
            customer: {
              email,
              name: fullName,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t('errors.paymentSessionFailed'));
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(t('errors.paymentUrlMissing'));
        }

        return;
      }

      // 3) Fallback: order exists, show confirmation
      setSuccessMessage(
        orderNumber
          ? t('success.withNumber', { orderNumber })
          : t('success.withoutNumber')
      );
      setShowSuccessModal(true);
      clearCart();
      setIsProcessing(false);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : t('errors.generic'));
      setIsProcessing(false);
    }
  };

  const getItemImage = (slug: string, id: string) => {
    const seed = seedProducts.find((p) => p.slug === slug || p.id === id);
    return seed?.images?.[0] ?? '/images/ui/wood/imgSpruce.png';
  };

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover (matches Figma 896:13072) */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] py-[32px] border-b border-[#BBBBBB]">
        <h1
          className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {t('title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px] pt-[64px]">
        <div className="grid grid-cols-1 lg:grid-cols-[672px_648px] gap-[32px] items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-[64px]">
            {/* Contact information */}
            <section className="flex flex-col gap-[24px]">
              <div className="flex items-center justify-between pb-[16px] border-b border-[#BBBBBB]">
                <p className="font-['Outfit'] font-normal leading-[1.3] text-[#161616] text-[12px] tracking-[0.6px] uppercase">
                  {t('contact.title')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="font-['Outfit'] font-normal leading-[1.2] text-[#161616] text-[12px] tracking-[0.6px] uppercase hover:opacity-70 transition-opacity"
                >
                  {t('contact.haveAccountLogin')}
                </button>
              </div>

              <div className="flex flex-wrap gap-[16px]">
                <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                  <FieldLabel>
                    <span>{t('contact.fullName')}</span>
                    <span className="text-[#F63333]">*</span>
                  </FieldLabel>
                  <TextField value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                  <FieldLabel>{t('contact.companyNameOptional')}</FieldLabel>
                  <TextField value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                  <FieldLabel>
                    <span>{t('contact.email')}</span>
                    <span className="text-[#F63333]">*</span>
                  </FieldLabel>
                  <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                  <FieldLabel>
                    <span>{t('contact.phone')}</span>
                    <span className="text-[#F63333]">*</span>
                  </FieldLabel>
                  <TextField type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
            </section>

            {/* Delivery method */}
            <section className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal leading-[1.3] text-[#161616] text-[12px] tracking-[0.6px] uppercase">
                  {t('delivery.title')}
                </p>
                <div className="h-px bg-[#BBBBBB]" />
              </div>

              <div className="flex flex-col gap-[24px]">
                <div className="flex flex-wrap gap-[16px]">
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('delivery.country')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={country} onChange={(e) => setCountry(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('delivery.city')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('delivery.address')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('delivery.postalCode')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                  </div>
                </div>

                <FigmaCheckbox
                  id="deliverDifferentAddress"
                  checked={deliverDifferentAddress}
                  onChange={setDeliverDifferentAddress}
                  label={t('delivery.deliverDifferentAddress')}
                />

                <div className="flex flex-col gap-[4px]">
                  <FieldLabel>{t('delivery.notesOptional')}</FieldLabel>
                  <TextAreaField value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={5} className="h-[148px]" />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal leading-[1.3] text-[#161616] text-[12px] tracking-[0.6px] uppercase">
                  {t('payment.title')}
                </p>
                <div className="h-px bg-[#BBBBBB]" />
              </div>

              <div className="flex flex-col gap-[16px]">
                <label className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-[8px]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className={[
                        'size-[24px]',
                        'appearance-none',
                        'rounded-[100px]',
                        'border border-[#161616] border-solid',
                        'grid place-items-center',
                        "checked:after:content-['']",
                        'checked:after:size-[10px] checked:after:rounded-full checked:after:bg-[#161616]',
                      ].join(' ')}
                    />
                    <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                      {t('payment.stripeCard')}
                    </span>
                  </span>
                  <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                    stripe
                  </span>
                </label>

                <div className="flex flex-wrap gap-[16px]">
                  <div className="flex flex-col gap-[4px] w-full">
                    <FieldLabel>
                      <span>{t('payment.cardNumber')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={''} onChange={() => {}} placeholder="" disabled />
                  </div>
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('payment.expiryDate')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={''} onChange={() => {}} placeholder="" disabled />
                  </div>
                  <div className="flex flex-col gap-[4px] w-full sm:w-[328px]">
                    <FieldLabel>
                      <span>{t('payment.cvc')}</span>
                      <span className="text-[#F63333]">*</span>
                    </FieldLabel>
                    <TextField value={''} onChange={() => {}} placeholder="" disabled />
                  </div>
                </div>

                <FigmaCheckbox
                  id="savePayment"
                  checked={savePaymentInfo}
                  onChange={setSavePaymentInfo}
                  label={t('payment.saveInfo')}
                />

                <div className="h-px bg-[#BBBBBB]" />

                <label className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-[8px]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cards"
                      checked={paymentMethod === 'cards'}
                      onChange={() => setPaymentMethod('cards')}
                      className={[
                        'size-[24px]',
                        'appearance-none',
                        'rounded-[100px]',
                        'border border-[#161616] border-solid',
                        'grid place-items-center',
                        "checked:after:content-['']",
                        'checked:after:size-[10px] checked:after:rounded-full checked:after:bg-[#161616]',
                      ].join(' ')}
                    />
                    <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                      {t('payment.creditDebitCard')}
                    </span>
                  </span>
                  <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                    visa
                  </span>
                </label>

                <div className="h-px bg-[#BBBBBB]" />

                <label className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-[8px]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className={[
                        'size-[24px]',
                        'appearance-none',
                        'rounded-[100px]',
                        'border border-[#161616] border-solid',
                        'grid place-items-center',
                        "checked:after:content-['']",
                        'checked:after:size-[10px] checked:after:rounded-full checked:after:bg-[#161616]',
                      ].join(' ')}
                    />
                    <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                      paypal
                    </span>
                  </span>
                  <span className="font-['Outfit'] font-normal leading-[1.2] text-[#535353] text-[12px] tracking-[0.6px] uppercase">
                    paypal
                  </span>
                </label>

                <div className="h-px bg-[#BBBBBB]" />

                <FigmaCheckbox
                  id="terms"
                  checked={agreedToTerms}
                  onChange={setAgreedToTerms}
                  required
                  label={t.rich('terms.agreeTo', {
                    terms: (chunks) => (
                      <Link href="/policies" className="underline">
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link href="/policies" className="underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                />

                {/* Error Message (kept from existing flow) */}
                {error && (
                  <div className="border border-red-200 bg-red-50 p-[16px]">
                    <p className="font-['Outfit'] text-[14px] text-red-600">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-[16px]">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="border border-[#161616] border-solid h-[48px] px-[40px] py-[10px] rounded-[100px] w-full sm:w-[328px] flex items-center justify-center"
                  >
                    <span className="font-['Outfit'] font-normal leading-[1.2] text-[#161616] text-[12px] tracking-[0.6px] uppercase">
                      {t('actions.backToCart')}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-[#161616] h-[48px] px-[40px] py-[10px] rounded-[100px] w-full sm:w-[328px] flex items-center justify-center disabled:bg-[#BBBBBB] disabled:cursor-not-allowed"
                  >
                    <span className="font-['Outfit'] font-normal leading-[1.2] text-white text-[12px] tracking-[0.6px] uppercase">
                      {isProcessing ? t('actions.processing') : t('actions.submitOrder')}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Order summary */}
          <aside className="w-full max-w-[648px]">
            <div className="bg-[#161616] p-[24px] sm:p-[40px] flex flex-col gap-[32px]">
              <p
                className="font-['DM_Sans'] font-normal leading-[1.1] text-[24px] text-white tracking-[-0.96px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {t('summary.title', { count: items.length })}
              </p>

              <div className="flex flex-col w-full">
                <div className="h-px bg-[#535353]" />
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.finish}`} className="py-[16px]">
                    <div className="flex gap-[14px] w-full">
                      <div className="relative w-[111px] h-[125px] overflow-hidden shrink-0">
                        <Image
                          src={getItemImage(item.slug, item.id)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="111px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-[16px]">
                          <p
                            className="font-['DM_Sans'] font-medium leading-[1.2] text-[18px] text-white tracking-[-0.36px] max-w-[224px]"
                            style={{ fontVariationSettings: "'opsz' 14" }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="font-['DM_Sans'] font-medium leading-[1.2] text-[18px] text-white tracking-[-0.36px]"
                            style={{ fontVariationSettings: "'opsz' 14" }}
                          >
                            {formatMoney(item.basePrice * item.quantity, locale)}
                          </p>
                        </div>

                        <div className="mt-[8px] flex items-end justify-between">
                          <div className="flex flex-col gap-[4px]">
                            {(item.color || item.finish) && (
                              <p className="font-['Outfit'] font-normal leading-[1.3] text-[#BBBBBB] text-[12px]">
                                {(item.color ? `${t('summary.colorLabel')} ${item.color}` : '') +
                                  (item.color && item.finish ? ' • ' : '') +
                                  (item.finish ? `${t('summary.finishLabel')} ${item.finish}` : '')}
                              </p>
                            )}
                            <p className="font-['Outfit'] font-normal leading-[1.3] text-[#BBBBBB] text-[12px]">
                              {t('summary.quantity', { count: item.quantity })}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="font-['Outfit'] font-normal leading-[1.2] text-white text-[12px] tracking-[0.6px] uppercase hover:opacity-70 transition-opacity"
                          >
                            {t('summary.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-[16px] h-px bg-[#535353]" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[16px]">
                <div className="flex items-center justify-between w-full font-['Outfit'] font-normal leading-[1.3] text-[12px] tracking-[0.6px] uppercase">
                  <p className="text-[#BBBBBB]">{t('summary.subtotal')}</p>
                  <p className="text-white">{formatMoney(subtotal, locale)}</p>
                </div>
                <div className="flex items-center justify-between w-full font-['Outfit'] font-normal leading-[1.3] text-[12px] tracking-[0.6px] uppercase">
                  <p className="text-[#BBBBBB]">{t('summary.shipping')}</p>
                  <p className="text-white">{formatMoney(shipping, locale)}</p>
                </div>
              </div>

              <div className="h-px bg-[#BBBBBB]" />

              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <p
                    className="font-['DM_Sans'] font-normal leading-[1.1] text-[24px] text-white tracking-[-0.96px]"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    {t('summary.total')}
                  </p>
                  <p className="font-['Outfit'] font-normal leading-[1.3] text-[#BBBBBB] text-[12px]">{t('summary.includingTaxes')}</p>
                </div>
                <p
                  className="font-['DM_Sans'] font-normal leading-[1.1] text-[24px] text-white tracking-[-0.96px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {formatMoney(total, locale)}
                </p>
              </div>
            </div>

            {/* Coupon pill */}
            <div className="mt-[16px] border border-[#BBBBBB] border-solid h-[56px] rounded-[100px] flex items-center justify-between pl-[24px] pr-[8px] py-[16px]">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t('coupon.placeholder')}
                className="bg-transparent outline-none font-['Outfit'] font-normal leading-[1.2] text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase flex-1 placeholder:text-[#7C7C7C]"
              />
              <button type="button" className="bg-[#161616] h-[48px] px-[40px] py-[10px] rounded-[100px] w-[118px] flex items-center justify-center">
                <span className="font-['Outfit'] font-normal leading-[1.2] text-white text-[12px] tracking-[0.6px] uppercase">{t('coupon.apply')}</span>
              </button>
            </div>
          </aside>
        </div>
      </form>

      {/* Modals */}
      <ModalOverlay isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onForgotPassword={() => {
            setShowLoginModal(false);
            setShowForgotPasswordModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)}>
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onSuccess={() => {
            setShowForgotPasswordModal(false);
            setSuccessMessage(t('success.passwordResetEmailSent'));
            setShowSuccessModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />
      </ModalOverlay>
    </main>
  );
}
