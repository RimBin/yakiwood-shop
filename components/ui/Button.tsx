'use client';

import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'link';
  size?: 'default' | 'small' | 'large';
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  href,
  onClick,
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const baseStyles = "font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.2] flex items-center justify-center gap-2 transition-all";
  
  const variantStyles = {
    primary: 'bg-[#161616] text-white hover:bg-[#333333]',
    secondary: 'bg-transparent border border-[#161616] text-[#161616] hover:bg-[#535353] hover:text-white',
    link: 'bg-transparent text-[#161616] hover:opacity-70 px-0 py-2',
  };

  const sizeStyles = {
    small: 'h-10 px-6 rounded-full',
    default: 'h-12 px-10 rounded-full',
    large: 'h-14 px-12 rounded-full',
  };

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${variant !== 'link' ? sizeStyles[size] : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
      {icon}
    </button>
  );
}

// Arrow icon component for link buttons
export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
