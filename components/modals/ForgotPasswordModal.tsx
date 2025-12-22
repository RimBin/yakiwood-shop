'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getAsset } from '@/lib/assets';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: ForgotPasswordModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      {/* Logo */}
      <div className="w-[126px] h-12 relative">
        <Image src={getAsset('imgLogo')} alt="Yakiwood Logo" fill style={{ objectFit: 'contain' }} />
      </div>

      {/* Title container */}
      <div className="w-full text-center opacity-80">
        <p className="font-['Outfit'] font-normal text-xs text-[#161616] uppercase tracking-[0.6px] leading-[1.2] mb-2">
          Reset your password
        </p>
        <p className="font-['Outfit'] font-light text-[14px] text-[#535353] tracking-[0.14px] leading-[1.2]">
          We will send you an email to reset your password
        </p>
      </div>

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
          {error && (
            <p className="font-['Outfit'] text-xs text-[#F63333] mt-1">{error}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#161616] rounded-[100px] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
        >
          <span className="font-['Outfit'] font-normal text-xs text-white uppercase tracking-[0.6px]">
            {isSubmitting ? 'Sending...' : 'Submit'}
          </span>
        </button>

        {/* Cancel link */}
        <button
          type="button"
          onClick={onClose}
          className="w-full text-center font-['Outfit'] font-normal text-xs text-[#161616] uppercase tracking-[0.6px] hover:underline"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
