'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/Checkbox';
import { createClient } from '@/lib/supabase/client';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageSection } from '@/components/shared/PageLayout';

export default function RegisterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const currentLocale: AppLocale = pathname.startsWith('/lt') ? 'lt' : 'en';
  const t = useTranslations('account');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isCompleteMode = searchParams.get('complete') === '1';

  const defaultRedirect = toLocalePath('/account', currentLocale);
  const nextRaw = searchParams.get('next');
  const nextPath = nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : defaultRedirect;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('registerForm.passwordMismatch'));
      return;
    }
    if (!agreeTerms) {
      setError(t('registerForm.termsRequired'));
      return;
    }

    if (!supabase) {
      setError(t('forgotPasswordForm.errorSupabase'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            receiveNews,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || t('forgotPasswordForm.errorGeneric'));
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('user_profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email || email,
            full_name: `${firstName} ${lastName}`.trim() || null,
            terms_accepted_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (profileError) {
          setError(profileError.message);
          return;
        }
      }

      router.push(nextPath);
    } catch (err: any) {
      setError(err?.message || t('forgotPasswordForm.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);

    if (!agreeTerms) {
      setError(t('registerForm.termsRequired'));
      return;
    }

    if (!supabase) {
      setError(t('forgotPasswordForm.errorSupabase'));
      return;
    }

    setIsSubmitting(true);

    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', nextPath);
      callbackUrl.searchParams.set('consent', '1');

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (oauthError) {
        setError(oauthError.message || t('oauthErrorGeneric'));
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || t('oauthErrorGeneric'));
      setIsSubmitting(false);
    }
  };

  const handleCompleteConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!agreeTerms) {
      setError(t('registerForm.termsRequired'));
      return;
    }

    if (!supabase) {
      setError(t('forgotPasswordForm.errorSupabase'));
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(userError?.message || t('loginRequired'));
        setIsSubmitting(false);
        router.push(toLocalePath('/login', currentLocale));
        return;
      }

      const fullName =
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim() || null;

      const { error: profileError } = await supabase.from('user_profiles').upsert(
        {
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          terms_accepted_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        setError(profileError.message || t('forgotPasswordForm.errorGeneric'));
        return;
      }

      setSuccess(t('completeRegistrationSuccess'));
      router.push(nextPath);
    } catch (err: any) {
      setError(err?.message || t('forgotPasswordForm.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
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
          <form onSubmit={isCompleteMode ? handleCompleteConsent : handleSubmit} className="bg-[#E1E1E1] rounded-[16px] p-[32px] sm:p-[40px] border border-[#BBBBBB]">
          {error ? (
            <p className="mb-[16px] font-['Outfit'] text-[12px] leading-[1.4] text-[#F63333]">{error}</p>
          ) : null}
          {success ? (
            <p className="mb-[16px] font-['Outfit'] text-[12px] leading-[1.4] text-[#161616]">{success}</p>
          ) : null}

          {!isCompleteMode ? (
          <>
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
          </>
          ) : (
            <div className="mb-[20px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353]">
                {t('completeRegistrationDescription')}
              </p>
            </div>
          )}

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
            disabled={isSubmitting}
            className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors mb-[24px] disabled:opacity-60"
          >
            {isCompleteMode ? t('completeRegistrationCta') : isSubmitting ? t('creatingAccount') : t('register')}
          </button>

          {!isCompleteMode ? (
            <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!agreeTerms || isSubmitting}
              className="w-full h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors mb-[24px] disabled:opacity-60"
            >
              {t('continueWithGoogle')}
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
          </>
          ) : null}
          </form>
        </div>
      </PageSection>
    </main>
  );
}
