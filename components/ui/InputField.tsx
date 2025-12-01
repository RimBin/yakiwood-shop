'use client';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
}: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7c7c7c]">
        {label}
        {required && <span className="text-[#f63333]"> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          h-12 px-4 border border-[#bbbbbb] bg-transparent
          font-['Outfit'] font-normal text-[14px] leading-[1.1] text-[#161616]
          outline-none transition-colors
          focus:border-[#161616]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#f63333]' : ''}
        `}
      />
      {error && (
        <p className="font-['Outfit'] font-normal text-[12px] text-[#f63333]">{error}</p>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7c7c7c]">
        {label}
        {required && <span className="text-[#f63333]"> *</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={`
          p-4 border border-[#bbbbbb] bg-transparent
          font-['Outfit'] font-normal text-[14px] leading-[1.1] text-[#161616]
          outline-none transition-colors resize-none
          focus:border-[#161616]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#f63333]' : ''}
        `}
      />
      {error && (
        <p className="font-['Outfit'] font-normal text-[12px] text-[#f63333]">{error}</p>
      )}
    </div>
  );
}
