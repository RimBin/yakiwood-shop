'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getAsset } from '@/lib/assets';

interface NewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
}

export default function NewPasswordModal({ 
  isOpen, 
  onClose,
  token,
  onSuccess 
}: NewPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      if (response.ok) {
        onSuccess();
      } else {
        setError('Reset link has expired. Please request a new one.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
          Reset account password
        </p>
        <p className="font-['Outfit'] font-light text-[14px] text-[#535353] tracking-[0.14px] leading-[1.2]">
          Enter a new password
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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

        {/* Confirm password field */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-['Outfit'] font-normal text-xs text-[#7C7C7C] uppercase tracking-[0.6px] leading-[1.3]">
            Confirm password <span className="text-[#F63333]">*</span>
          </label>
          <div className="relative h-12 border border-[#BBBBBB] flex items-center">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 h-full px-4 bg-transparent font-['Outfit'] text-xs uppercase tracking-[0.6px] text-[#161616] focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="px-4 h-full flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#161616" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#161616" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
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
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </span>
        </button>
      </form>
    </div>
  );
}
