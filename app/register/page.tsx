'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/Checkbox';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageSection } from '@/components/shared/PageLayout';

export default function RegisterPage() {
  const pathname = usePathname();
  const currentLocale: AppLocale = pathname.startsWith('/lt') ? 'lt' : 'en';
  const t = useTranslations('account');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('registerForm.passwordMismatch'));
      return;
    }
    if (!agreeTerms) {
      alert(t('registerForm.termsRequired'));
      return;
    }
    console.log('Register with:', { firstName, lastName, email, password, receiveNews });
  };

  return (
    <main className="w-full bg-[#E1E1E1]">
      <PageCover>
        <h1
          className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {t('registerForm.title')}
        </h1>
      </PageCover>

      <PageSection className="pt-[40px] md:pt-[56px] pb-[80px]">
        <div className="w-full max-w-[640px] mx-auto">
          <div className="mb-[24px] text-center">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353]">
              {t('registerForm.subtitle')}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="bg-[#E1E1E1] rounded-[16px] p-[32px] sm:p-[40px] border border-[#BBBBBB]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] mb-[20px]">
            <div>
              <label htmlFor="firstName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('registerForm.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder={t('registerForm.firstNamePlaceholder')}
                className="yw-input w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] bg-[#E1E1E1] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('registerForm.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder={t('registerForm.lastNamePlaceholder')}
                className="yw-input w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] bg-[#E1E1E1] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('registerForm.emailPlaceholder')}
                className="yw-input w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] bg-[#E1E1E1] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('registerForm.passwordPlaceholder')}
                className="yw-input w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] bg-[#E1E1E1] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t('registerForm.confirmPasswordPlaceholder')}
                className="yw-input w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] bg-[#E1E1E1] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-[16px] mb-[32px]">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onChange={setAgreeTerms}
              label={
                <span className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#161616]">
                  {t('registerForm.termsPrefix')}{' '}
                  <Link href={toLocalePath('/policies', currentLocale)} className="underline hover:opacity-70">
                    {t('registerForm.termsLink')}
                  </Link>{' '}
                  {t('registerForm.termsMiddle')}{' '}
                  <Link href={toLocalePath('/policies', currentLocale)} className="underline hover:opacity-70">
                    {t('registerForm.privacyLink')}
                  </Link>
                </span>
              }
            />

            <Checkbox
              id="receiveNews"
              checked={receiveNews}
              onChange={setReceiveNews}
              label={
                <span className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#161616]">
                  {t('registerForm.newsletter')}
                </span>
              }
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors mb-[24px]"
          >
            {t('register')}
          </button>

          {/* Divider */}
          <div className="relative mb-[24px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#BBBBBB]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#E1E1E1] px-[16px] font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                {t('alreadyHaveAccount')}
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href={toLocalePath('/login', currentLocale)}
              className="inline-flex w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors items-center justify-center"
            >
              {t('login')}
            </Link>
          </div>
          </form>
        </div>
      </PageSection>
    </main>
  );
}
