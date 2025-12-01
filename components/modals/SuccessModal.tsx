'use client';

import React from 'react';
import Image from 'next/image';
import { getAsset } from '@/lib/assets';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({ 
  isOpen, 
  onClose,
  message 
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="relative w-[479px] h-[249px] bg-[#E1E1E1] p-10 flex flex-col gap-6 items-center">
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

      {/* Message */}
      <p className="font-['Outfit'] font-normal text-xs text-[#161616] text-center uppercase tracking-[0.6px] leading-[1.2] w-[283px]">
        {message}
      </p>
    </div>
  );
}
