'use client';

import React from 'react';

interface CheckboxProps {
  id: string;
  label: string | React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ id, label, checked = false, onChange }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-[8px] cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="hidden"
      />
      <div className={`w-[24px] h-[24px] rounded-[4px] border-2 flex items-center justify-center shrink-0 ${
        checked ? 'border-[#161616] bg-[#161616]' : 'border-[#BBBBBB]'
      }`}>
        {checked && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
        {label}
      </div>
    </label>
  );
}
