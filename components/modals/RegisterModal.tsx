'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
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
      setError('Please agree to Terms & Conditions');
      return;
    }

    setLoading(true);
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
        Create account
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Full name field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            Full name <span className="text-[#F63333]">*</span>
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

        {/* Terms checkbox */}
        <label className="flex gap-1 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-6 h-6 border border-[#161616] mt-0.5"
          />
          <span className="font-['Outfit'] font-light text-sm text-[#535353] leading-[1.2] tracking-[0.14px]">
            I agree to the <span className="underline">Term & Conditions</span> and <span className="underline">Privacy Policy</span>
          </span>
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#161616] rounded-[100px] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
        >
          <span className="font-['Outfit'] font-normal text-xs text-white uppercase tracking-[0.6px]">
            {loading ? 'Creating...' : 'Join'}
          </span>
        </button>

        {/* Login link */}
        <div className="flex justify-center gap-1 font-['Outfit'] text-xs text-[#535353]">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#161616] uppercase tracking-[0.6px] hover:underline"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}
