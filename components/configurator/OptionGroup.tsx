'use client';

import type React from 'react';

export interface Option<T extends string> {
  value: T;
  label: string;
}

export interface OptionGroupProps<T extends string> {
  label: string;
  ariaLabel: string;
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  renderOptionLabel?: (opt: Option<T>) => React.ReactNode;
}

export default function OptionGroup<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  renderOptionLabel,
}: OptionGroupProps<T>) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">{label}</p>
      <div className="flex gap-[8px] flex-wrap" role="group" aria-label={ariaLabel}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`h-[32px] px-[12px] rounded-[100px] border font-['Outfit'] text-[10px] tracking-[0.6px] uppercase transition-colors ${
                active ? 'bg-[#161616] border-[#161616] text-white' : 'bg-transparent border-[#BBBBBB] text-[#535353] hover:text-[#161616]'
              }`}
              aria-pressed={active}
              aria-label={`${ariaLabel}: ${opt.label}`}
              data-testid={`option-${ariaLabel}-${opt.value}`}
            >
              {renderOptionLabel ? renderOptionLabel(opt) : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
