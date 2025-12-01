'use client';

interface RadioButtonProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  value: string;
  disabled?: boolean;
  className?: string;
}

export default function RadioButton({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  className = '',
}: RadioButtonProps) {
  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative w-5 h-5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
            ${checked ? 'border-[#161616]' : 'border-[#bbbbbb]'}
          `}
        >
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#161616]" />
          )}
        </div>
      </div>
      <span className="font-['Outfit'] font-normal text-[14px] leading-[1.1] text-[#161616]">
        {label}
      </span>
    </label>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative w-5 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className={`
            w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors
            ${checked ? 'bg-[#161616] border-[#161616]' : 'border-[#bbbbbb]'}
          `}
        >
          {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="font-['Outfit'] font-normal text-[14px] leading-[1.1] text-[#161616]">
        {label}
      </span>
    </label>
  );
}
