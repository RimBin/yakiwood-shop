'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { getAsset } from '@/lib/assets';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSwitchToRegister,
  onForgotPassword 
}: LoginModalProps) {
  const t = useTranslations();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      onClose();
    }

    setLoading(false);
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
        Log in
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            Email <span className="text-[#F63333]">*</span>
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
            Password <span className="text-[#F63333]">*</span>
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

        {/* Forgot password link */}
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-left font-['Outfit'] font-normal text-xs text-[#161616] uppercase tracking-[0.6px] hover:underline"
        >
          Forgot password?
        </button>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#161616] rounded-[100px] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
        >
          <span className="font-['Outfit'] font-normal text-xs text-white uppercase tracking-[0.6px]">
            {loading ? 'Logging in...' : 'Log in'}
          </span>
        </button>

        {/* Register link */}
        <div className="flex justify-center gap-1 font-['Outfit'] text-xs text-[#535353]">
          <span>Don't have an account?</span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#161616] uppercase tracking-[0.6px] hover:underline"
          >
            Join
          </button>
        </div>
      </form>
    </div>
  );
}
