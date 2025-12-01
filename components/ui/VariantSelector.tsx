'use client';

interface VariantSelectorProps {
  label: string;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function VariantSelector({ label, options, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
        {label}
      </p>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`h-12 px-3 flex items-center justify-center relative ${
                isSelected
                  ? 'bg-[#161616] text-white'
                  : 'bg-transparent border border-[#bbbbbb] text-[#161616]'
              }`}
              style={{ minWidth: '114px' }}
            >
              <span className="font-['Outfit'] font-normal text-[14px] leading-[1.1] tracking-[0.42px] uppercase">
                {option.label}
              </span>
              {isSelected && (
                <div className="absolute top-1 right-1 w-3 h-3">
                  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="12" rx="1" fill="white"/>
                    <path d="M9 4L5 8L3 6" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
