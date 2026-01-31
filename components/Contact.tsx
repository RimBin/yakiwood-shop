'use client';

import React, { useState } from 'react';
import { PageCover } from '@/components/shared/PageLayout';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';
import InView from '@/components/InView';

export default function Contact() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    // Honeypot field (hidden)
    company: '',
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = React.useRef<number>(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    
    setIsSubmitting(true);

    trackEvent('contact_submit_attempt', {
      method: 'contact_form',
      has_phone: Boolean(formData.phone?.trim()),
    });

    try {
      setError(null);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          startedAt: startedAtRef.current,
        }),
      });

      if (!res.ok) {
        trackEvent('contact_submit_error', {
          method: 'contact_form',
          status: res.status,
        });
        setError(t('messageError'));
        setIsSubmitting(false);
        return;
      }

      trackEvent('generate_lead', {
        method: 'contact_form',
      });

      setSubmitted(true);
      setFormData({ fullName: '', email: '', phone: '', company: '' });
      setConsent(false);
      startedAtRef.current = Date.now();
    } catch {
      trackEvent('contact_submit_error', {
        method: 'contact_form',
        status: 'network_error',
      });
      setError(t('messageError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Title */}
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {t('title')}
          </h1>
        </PageCover>
      </InView>

      {/* Subtitle + Form */}
      <InView className="hero-animate-root">
      <div className="w-full flex flex-col items-center pt-[64px] md:pt-[80px] lg:pt-[100px] pb-[80px] md:pb-[100px] lg:pb-[120px] px-[16px] md:px-[32px] lg:px-[40px]">
        <p className="font-['DM_Sans'] font-light leading-none text-[#161616] text-center mb-[40px] md:mb-[54px] lg:mb-[68px] max-w-[838px] hero-seq-item hero-seq-right" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: 'clamp(-1.28px, -0.04em, -2.08px)', fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}>
          {t('subtitle')}
        </p>

        <div className="w-full max-w-[600px] hero-seq-item hero-seq-right" style={{ animationDelay: '220ms' }}>
          {submitted ? (
            <div className="text-center py-[40px]">
              <p 
                className="font-['DM_Sans'] font-normal text-[32px] text-[#161616] tracking-[-1.28px] mb-[16px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {t('thankYou')}
              </p>
              <p className="font-['Outfit'] font-light text-[16px] text-[#7C7C7C] tracking-[0.16px]">
                {t('thankYouMessage')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              {/* Honeypot (anti-spam) */}
              <div className="hidden" aria-hidden="true">
                <label>
                  Company
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </label>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  {t('fullName')} <span className="text-[#F63333]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  {t('email')} <span className="text-[#F63333]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-[4px]">
                <button
                  type="button"
                  onClick={() => setConsent(!consent)}
                  className={`w-[24px] h-[24px] border border-[#161616] flex items-center justify-center shrink-0 transition-colors ${
                    consent ? 'bg-[#161616]' : 'bg-transparent'
                  }`}
                  aria-label="Consent checkbox"
                >
                  {consent && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <p className="flex-1 font-['Outfit'] font-light text-[12px] text-[#535353] leading-[1.3] tracking-[0.14px]">
                  {t('privacyConsent')}{' '}
                  <Link href="/privacy-policy" className="text-[#161616] font-normal underline">
                    {t('privacyPolicy')}
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !consent}
                className="w-full h-[48px] bg-[#161616] rounded-[100px] flex items-center justify-center font-['Outfit'] font-normal text-white text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 px-[40px] py-[10px]"
              >
                {isSubmitting ? t('sending') : t('leaveRequest')}
              </button>

              {error && (
                <p className="font-['Outfit'] font-light text-[12px] text-[#F63333] leading-[1.3] tracking-[0.14px]">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
      </InView>
    </section>
  );
}
