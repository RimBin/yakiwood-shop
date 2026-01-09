'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {
  COOKIE_CONSENT_OPEN_EVENT,
  getConsentFromDocumentCookie,
  setConsentCookie,
  type CookieConsent,
} from '@/lib/cookies/consent';

export default function CookieConsentBanner() {
  const t = useTranslations('cookieConsent');

  const [checked, setChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getConsentFromDocumentCookie();
    setChecked(true);
    setIsVisible(!existing);

    // Pre-fill controls from existing consent if present (shouldn't show, but safe).
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const handleOpen = () => {
      const current = getConsentFromDocumentCookie();
      setAnalytics(Boolean(current?.analytics));
      setMarketing(Boolean(current?.marketing));
      setIsCustomizing(true);
      setIsVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  const policyHref = useMemo(() => '/cookie-policy', []);

  if (!checked || !isVisible) return null;

  const acceptAll = () => {
    setConsentCookie({analytics: true, marketing: true});
    setIsVisible(false);
  };

  const rejectAll = () => {
    setConsentCookie({analytics: false, marketing: false});
    setIsVisible(false);
  };

  const savePreferences = () => {
    const consent: CookieConsent = {analytics, marketing};
    setConsentCookie(consent);
    setIsVisible(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      role="dialog"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-[1440px] px-[16px] sm:px-[40px] pb-[16px]">
        <div className="rounded-[24px] border border-[#BBBBBB] bg-white px-[16px] sm:px-[24px] py-[16px] sm:py-[18px]">
          <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[880px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.4] text-[#161616]">
                {t('description')}{' '}
                <Link
                  href={policyHref}
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  {t('policyLink')}
                </Link>
              </p>

              {isCustomizing && (
                <div className="mt-[12px] grid gap-[10px]">
                  <label className="flex items-start gap-[10px]">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-[2px] h-[16px] w-[16px]"
                      aria-label={t('necessary')}
                    />
                    <span className="font-['Outfit'] text-[14px] leading-[1.4] text-[#161616]">
                      <span className="font-normal">{t('necessary')}</span>{' '}
                      <span className="font-light">({t('alwaysOn')})</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-[10px]">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="mt-[2px] h-[16px] w-[16px]"
                      aria-label={t('analytics')}
                    />
                    <span className="font-['Outfit'] text-[14px] leading-[1.4] text-[#161616]">
                      <span className="font-normal">{t('analytics')}</span>{' '}
                      <span className="font-light">({t('analyticsHint')})</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-[10px]">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="mt-[2px] h-[16px] w-[16px]"
                      aria-label={t('marketing')}
                    />
                    <span className="font-['Outfit'] text-[14px] leading-[1.4] text-[#161616]">
                      <span className="font-normal">{t('marketing')}</span>{' '}
                      <span className="font-light">({t('marketingHint')})</span>
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={rejectAll}
                className="border border-[#161616] rounded-[100px] h-[44px] px-[18px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] bg-transparent hover:bg-[#F5F5F5] transition-colors"
              >
                {t('reject')}
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizing((v) => !v)}
                className="border border-[#161616] rounded-[100px] h-[44px] px-[18px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] bg-transparent hover:bg-[#F5F5F5] transition-colors"
                aria-expanded={isCustomizing}
              >
                {t('customize')}
              </button>

              {isCustomizing ? (
                <button
                  type="button"
                  onClick={savePreferences}
                  className="border border-[#161616] rounded-[100px] h-[44px] px-[18px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-white bg-[#161616] hover:opacity-90 transition-opacity"
                >
                  {t('save')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={acceptAll}
                  className="border border-[#161616] rounded-[100px] h-[44px] px-[18px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-white bg-[#161616] hover:opacity-90 transition-opacity"
                >
                  {t('accept')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
