'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageSection } from '@/components/shared/PageLayout';

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const currentLocale: AppLocale = pathname.startsWith('/lt') ? 'lt' : 'en';
  const t = useTranslations('account');
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!supabase) {
        setError(t('forgotPasswordForm.errorSupabase'));
        return;
      }

      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${toLocalePath('/reset-password', currentLocale)}`
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
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
          {t('forgotPassword')}
        </h1>
      </PageCover>

      <PageSection className="pt-[40px] md:pt-[56px] pb-[80px]">
        <div className="w-full max-w-[520px] mx-auto flex flex-col gap-[20px]">
          <p className="text-center font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353]">
            {t('forgotPasswordForm.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="bg-[#E1E1E1] rounded-[16px] p-[32px] border border-[#BBBBBB] flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
                {t('emailAddress')} <span className="text-[#F63333]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="yw-input h-12 border border-[#BBBBBB] bg-[#E1E1E1] px-4 font-['Outfit'] text-xs uppercase tracking-[0.6px] text-[#161616] focus:outline-none focus:border-[#161616]"
                required
              />
            </div>

            {error ? (
              <p className="font-['Outfit'] text-xs text-[#F63333]">{error}</p>
            ) : null}

            {success ? (
              <div className="flex flex-col gap-1">
                <p className="font-['Outfit'] text-xs text-[#161616]">{t('forgotPasswordForm.success')}</p>
                <p className="font-['Outfit'] text-[11px] text-[#535353]">{t('forgotPasswordForm.successNote')}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#161616] rounded-[100px] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              <span className="font-['Outfit'] font-normal text-xs text-white uppercase tracking-[0.6px]">
                {isSubmitting ? t('forgotPasswordForm.sending') : t('forgotPasswordForm.submit')}
              </span>
            </button>

            <Link
              href={toLocalePath('/login', currentLocale)}
              className="w-full text-center font-['Outfit'] font-normal text-xs text-[#161616] uppercase tracking-[0.6px] hover:underline"
            >
              {t('forgotPasswordForm.cancel')}
            </Link>
          </form>
        </div>
      </PageSection>
    </main>
  );
}
