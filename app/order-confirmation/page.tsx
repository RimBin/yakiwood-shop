'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart/store';
import {
  clearPendingPurchase,
  isPurchaseTracked,
  loadPendingPurchase,
  markPurchaseTracked,
  PendingPurchase,
  trackPurchase,
} from '@/lib/analytics';
import { toLocalePath } from '@/i18n/paths';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const paypalOrderId = searchParams.get('token');
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PendingPurchase | null>(null);
  const clearCart = useCartStore(state => state.clear);
  const t = useTranslations('orderConfirmationPage');

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(currentLocale === 'lt' ? 'lt-LT' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
      }),
    [currentLocale]
  );

  useEffect(() => {
    const run = async () => {
      // PayPal return flow: PayPal appends `token` to return_url. We also include our internal order_id.
      if (provider === 'paypal') {
        if (!paypalOrderId) {
          setError('Nerastas PayPal mokėjimo identifikatorius')
          setLoading(false)
          return
        }

        try {
          const res = await fetch('/api/paypal/capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paypalOrderId,
              orderId: orderId || undefined,
            }),
          })

          const data = await res.json().catch(() => null)

          if (!res.ok) {
            throw new Error(data?.error || 'Nepavyko patvirtinti PayPal mokėjimo')
          }

          clearCart()

          const key = paypalOrderId || orderId || ''
          const pending = loadPendingPurchase()
          setPurchase(pending)
          if (key && !isPurchaseTracked(key) && pending) {
            trackPurchase(key, pending.total, pending.items)
            markPurchaseTracked(key)
            clearPendingPurchase()
          }

          setLoading(false)
          return
        } catch (e: any) {
          setError(typeof e?.message === 'string' ? e.message : 'Nepavyko patvirtinti PayPal mokėjimo')
          setLoading(false)
          return
        }
      }

      // Paysera return flow: accepturl includes our internal order_id. Payment is confirmed via webhook only.
      if (provider === 'paysera') {
        if (!orderId) {
          setError('Nerastas užsakymo identifikatorius')
          setLoading(false)
          return
        }

        clearCart()

        const key = orderId
        const pending = loadPendingPurchase()
        setPurchase(pending)
        if (key && !isPurchaseTracked(key) && pending) {
          trackPurchase(key, pending.total, pending.items)
          markPurchaseTracked(key)
          clearPendingPurchase()
        }

        setLoading(false)
        return
      }

      // Default: Stripe flow uses `session_id`.
      if (!sessionId) {
        setError('Nerasta sesijos ID')
        setLoading(false)
        return
      }

      clearCart()

      const key = sessionId
      const pending = loadPendingPurchase()
      setPurchase(pending)
      if (key && !isPurchaseTracked(key) && pending) {
        trackPurchase(key, pending.total, pending.items)
        markPurchaseTracked(key)
        clearPendingPurchase()
      }

      setLoading(false)
    }

    void run()
  }, [provider, paypalOrderId, orderId, sessionId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161616] mx-auto mb-4"></div>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[24px] p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-['DM_Sans'] font-light text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616] mb-4">
            {t('errorTitle')}
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353] mb-6">
            {error}
          </p>
          <Link
            href="/"
            className="inline-block h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors flex items-center justify-center"
          >
            {t('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-[24px] p-8 md:p-12">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-['DM_Sans'] font-light text-[40px] md:text-[48px] leading-[1.1] tracking-[-1.92px] text-[#161616] text-center mb-4">
          {t('title')}
        </h1>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="font-['Outfit'] text-[16px] leading-[1.5] text-[#535353] mb-4">
            {provider === 'paysera' ? t('messagePaysera') : t('messagePaid')}
          </p>
          <p className="font-['Outfit'] text-[14px] leading-[1.5] text-[#535353]">
            {provider === 'paypal' ? (
              <>
                {t('paypalIdLabel')}: <span className="font-mono text-[12px]">{paypalOrderId}</span>
              </>
            ) : provider === 'paysera' ? (
              <>
                {t('orderIdLabel')}: <span className="font-mono text-[12px]">{orderId}</span>
              </>
            ) : (
              <>
                {t('sessionIdLabel')}: <span className="font-mono text-[12px]">{sessionId}</span>
              </>
            )}
          </p>
        </div>

        {/* Order Summary */}
        <div className="border border-[#E1E1E1] rounded-[16px] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['DM_Sans'] font-light text-[20px] leading-[1.1] tracking-[-0.8px] text-[#161616]">
              {t('summaryTitle')}
            </h2>
            {purchase?.total != null && (
              <span className="font-['Outfit'] text-[14px] text-[#161616]">
                {t('summaryTotal')}: {formatter.format(purchase.total)}
              </span>
            )}
          </div>

          {purchase?.items?.length ? (
            <div className="space-y-4">
              {purchase.items.map((item, index) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div key={`${item.id}-${index}`} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-['Outfit'] text-[14px] text-[#161616] truncate">
                        {item.name}
                      </p>
                      {item.variant ? (
                        <p className="font-['Outfit'] text-[12px] text-[#535353]">
                          {t('variantLabel')}: {item.variant}
                        </p>
                      ) : null}
                      <p className="font-['Outfit'] text-[12px] text-[#535353]">
                        {t('qtyLabel')}: {item.quantity} · {t('priceLabel')}: {formatter.format(item.price)}
                      </p>
                    </div>
                    <div className="font-['Outfit'] text-[14px] text-[#161616] whitespace-nowrap">
                      {formatter.format(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-['Outfit'] text-[14px] text-[#535353]">
              {t('summaryEmpty')}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-[#F5F5F5] rounded-[16px] p-6 mb-8">
          <h2 className="font-['DM_Sans'] font-light text-[20px] leading-[1.1] tracking-[-0.8px] text-[#161616] mb-4">
            {t('nextStepsTitle')}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#161616] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-['Outfit'] text-[10px]">1</span>
              </div>
              <p className="font-['Outfit'] text-[14px] leading-[1.5] text-[#161616]">
                {t('nextStep1')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#161616] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-['Outfit'] text-[10px]">2</span>
              </div>
              <p className="font-['Outfit'] text-[14px] leading-[1.5] text-[#161616]">
                {t('nextStep2')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#161616] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-['Outfit'] text-[10px]">3</span>
              </div>
              <p className="font-['Outfit'] text-[14px] leading-[1.5] text-[#161616]">
                {t('nextStep3')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#161616] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-['Outfit'] text-[10px]">4</span>
              </div>
              <p className="font-['Outfit'] text-[14px] leading-[1.5] text-[#161616]">
                {t('nextStep4')}
              </p>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={toLocalePath('/account', currentLocale)}
            className="flex-1 h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors flex items-center justify-center"
          >
            {t('viewOrders')}
          </Link>
          <Link
            href={toLocalePath('/products', currentLocale)}
            className="flex-1 h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors flex items-center justify-center"
          >
            {t('continueShopping')}
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-8 border-t border-[#E1E1E1] text-center">
          <p className="font-['Outfit'] text-[14px] text-[#535353] mb-2">
            {t('supportTitle')}
          </p>
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="font-['Outfit'] text-[14px] text-[#161616] hover:underline"
          >
            {t('supportLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}

