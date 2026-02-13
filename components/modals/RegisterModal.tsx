'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { getAsset } from '@/lib/assets';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ 
  isOpen, 
  onClose,
  onSwitchToLogin 
}: RegisterModalProps) {
  const t = useTranslations('account');
  const supabase = useMemo(() => createClient(), []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) {
      setError(t('agreeToTermsError'));
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      onClose();
    }

    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    if (!agreeTerms) {
      setError(t('agreeToTermsError'));
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    const nextPath = `${window.location.pathname}${window.location.search}`;
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', nextPath || '/account');
    callbackUrl.searchParams.set('consent', '1');

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-[479px] bg-[#E1E1E1] p-10 flex flex-col gap-6 items-center">
      {/* Close button */}
      <div className="w-full flex justify-end">
        <button 
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#161616" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {error && <p className="w-full text-center text-xs text-[#F63333] -mt-2">{error}</p>}

      {/* Logo */}
      <div className="w-[126px] h-12 relative">
        <Image src={getAsset('imgLogo')} alt="Yakiwood Logo" fill style={{ objectFit: 'contain' }} />
      </div>

      {/* Title */}
      <p className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.2]">
        {t('createAccount')}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Full name field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            {t('fullName')} <span className="text-[#F63333]">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 border border-[#BBBBBB] p-4 bg-transparent font-['Outfit'] text-xs uppercase tracking-[0.6px] text-[#161616] focus:outline-none focus:border-[#161616]"
            required
          />
        </div>

        {/* Email field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            {t('emailAddress')} <span className="text-[#F63333]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border border-[#BBBBBB] p-4 bg-transparent font-['Outfit'] text-xs uppercase tracking-[0.6px] text-[#161616] focus:outline-none focus:border-[#161616]"
            required
          />
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            {t('password')} <span className="text-[#F63333]">*</span>
          </label>
          <div className="relative h-12 border border-[#BBBBBB] flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 h-full px-4 bg-transparent font-['Outfit'] text-xs uppercase tracking-[0.6px] text-[#161616] focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 h-full flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#161616" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#161616" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Terms checkbox */}
        <label className="flex gap-1 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-6 h-6 border border-[#161616] mt-0.5"
          />
          <span className="font-['Outfit'] font-light text-sm text-[#535353] leading-[1.2] tracking-[0.14px]">
            {t('agreeToTerms')}
          </span>
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#161616] rounded-[100px] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
        >
          <span className="font-['Outfit'] font-normal text-xs text-white uppercase tracking-[0.6px]">
            {loading ? t('creatingAccount') : t('register')}
          </span>
        </button>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || !agreeTerms}
          className="w-full h-12 border border-[#161616] rounded-[100px] flex items-center justify-center gap-2 hover:bg-[#161616] hover:text-white transition-colors disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          <span className="font-['Outfit'] font-normal text-xs uppercase tracking-[0.6px]">
            {t('continueWithGoogle')}
          </span>
        </button>

        {/* Login link */}
        <div className="flex justify-center gap-1 font-['Outfit'] text-xs text-[#535353]">
          <span>{t('alreadyHaveAccount')}</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#161616] uppercase tracking-[0.6px] hover:underline"
          >
            {t('login')}
          </button>
        </div>
      </form>
    </div>
  );
}
