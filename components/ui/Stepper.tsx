'use client';

import React from 'react';

interface StepperProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Stepper({ currentPage, totalPages, onPageChange }: StepperProps) {
  return (
    <div className="flex items-center gap-[16px]">
      <button
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-[48px] h-[48px] rounded-full border border-[#BBBBBB] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#535353] hover:border-[#161616] group transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white"/>
        </svg>
      </button>

      <div className="flex items-center gap-[8px]">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`min-w-[32px] h-[32px] px-[8px] rounded-full font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
              page === currentPage
                ? 'bg-[#161616] text-white'
                : 'text-[#161616] hover:bg-[#E1E1E1]'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-[48px] h-[48px] rounded-full border border-[#BBBBBB] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#535353] hover:border-[#161616] group transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white"/>
        </svg>
      </button>
    </div>
  );
}
