'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageSection } from '@/components/shared/PageLayout';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('account');

  const currentLocale: AppLocale = pathname.startsWith('/lt') ? 'lt' : 'en';

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(oauthError);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase nesukonfigūruotas arba raktai neteisingi (.env.local).');
      }

      const defaultRedirect = toLocalePath('/account', currentLocale);
      const redirectPath = searchParams.get('redirect') || defaultRedirect;
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', redirectPath);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (oauthError) {
        throw new Error(oauthError.message || 'Nepavyko prisijungti su Google');
      }
    } catch (e: any) {
      setError(e?.message || 'Nepavyko prisijungti su Google');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase nesukonfigūruotas arba raktai neteisingi (.env.local).');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg = String(signInError.message || '')
        if (msg.toLowerCase().includes('invalid api key')) {
          throw new Error('Supabase raktai neteisingi (Invalid API key). Patikrinkite NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        }
        throw new Error('Neteisingas el. paštas arba slaptažodis');
      }

      const defaultRedirect = toLocalePath('/account', currentLocale);
      const redirectTo = searchParams.get('redirect') || defaultRedirect;
      router.push(redirectTo);
    } catch (e: any) {
      setError(e?.message || 'Nepavyko prisijungti');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setError(null);
    setLoading(true);

    const demoCredentials = {
      admin: { email: 'admin@yakiwood.lt', password: 'demo123', name: 'Admin User' },
      user: { email: 'user@yakiwood.lt', password: 'demo123', name: 'Demo User' }
    };

    const demo = demoCredentials[role];
    setEmail(demo.email);
    setPassword(demo.password);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase nesukonfigūruotas arba raktai neteisingi (.env.local).');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      if (signInError) {
        const msg = String(signInError.message || '')
        if (msg.toLowerCase().includes('invalid api key')) {
          throw new Error('Supabase raktai neteisingi (Invalid API key). Patikrinkite NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        }
        throw new Error('Demo vartotojas nerastas Supabase. Paleiskite `npm run demo:bootstrap-users` arba susikurkite vartotojus Supabase Auth dalyje.');
      }

      const defaultRedirect = role === 'admin'
        ? toLocalePath('/admin', currentLocale)
        : toLocalePath('/account', currentLocale);
      const redirectTo = searchParams.get('redirect') || defaultRedirect;
      router.push(redirectTo);
    } catch (e: any) {
      setError(e?.message || 'Nepavyko prisijungti');
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-[#E1E1E1]">
      <PageCover>
        <h1
          className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {t('signIn')}
        </h1>
      </PageCover>

      <PageSection className="pt-[40px] md:pt-[56px] pb-[80px]">
        <div className="w-full max-w-[478px] mx-auto flex flex-col gap-[24px]">

        {/* Don't have account + Create account link */}
        <div className="flex gap-[8px] items-center justify-center">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
            {t('dontHaveAccount')}
          </p>
          <Link
            href={toLocalePath('/register', currentLocale)}
            className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:underline"
          >
            {t('register')}
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-[12px] bg-red-50 border border-red-200 rounded">
            <p className="font-['Outfit'] text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] w-full">
          {/* Email field */}
          <div className="flex flex-col gap-[4px] w-full">
            <label htmlFor="email" className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]">
              {t('emailAddress')} <span className="text-[#F63333]">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="yw-input h-[48px] w-full border border-[#BBBBBB] bg-[#E1E1E1] px-[16px] font-['Outfit'] font-normal text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] transition-colors"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-[4px] w-full">
            <label htmlFor="password" className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]">
              {t('password')} <span className="text-[#F63333]">*</span>
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="yw-input h-[48px] w-full border border-[#BBBBBB] bg-[#E1E1E1] px-[16px] pr-[48px] font-['Outfit'] font-normal text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex justify-start">
            <Link
              href={toLocalePath('/forgot-password', currentLocale)}
              className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors disabled:opacity-60"
          >
            {loading ? t('loggingIn') : t('signIn')}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-[48px] border border-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-[8px]"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            {t('continueWithGoogle')}
          </button>

          {/* Demo logins */}
          <div className="flex flex-col gap-[8px] pt-[8px] border-t border-[#BBBBBB]">
            <p className="font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#7C7C7C] text-center">
              {t('demoLogin')}
            </p>
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="flex-1 h-[36px] border border-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors disabled:opacity-60"
              >
                {t('admin')}
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="flex-1 h-[36px] border border-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors disabled:opacity-60"
              >
                {t('user')}
              </button>
            </div>
          </div>
        </form>
        </div>
      </PageSection>
    </main>
  );
}
