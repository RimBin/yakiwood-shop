'use client'

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import type { LinkProps } from 'next/link'
import Link from 'next/link'

type ClassValue = string | undefined | null | false

function cx(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ')
}

export function AdminBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cx('pb-[clamp(32px,5vw,64px)]', className)}>
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px]">{children}</div>
    </main>
  )
}

export function AdminStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('space-y-[clamp(16px,2vw,24px)]', className)}>{children}</div>
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'bg-[#E1E1E1] border border-[#BBBBBB] rounded-[24px] p-[clamp(20px,3vw,32px)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label
      className={cx(
        "block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]",
        className
      )}
    >
      {children}
    </label>
  )
}

export function AdminInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-[48px] w-full rounded-[100px] bg-[#E1E1E1] border border-[#BBBBBB] px-[16px] font-['Outfit'] text-[14px] text-[#161616] outline-none focus:border-[#161616] transition-colors",
        className
      )}
    />
  )
}

export function AdminSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "h-[48px] w-full rounded-[100px] bg-[#E1E1E1] border border-[#BBBBBB] px-[16px] font-['Outfit'] text-[14px] text-[#161616] outline-none focus:border-[#161616] transition-colors yw-select",
        className
      )}
    />
  )
}

export function AdminTextarea({
  className,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & { className?: string }) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-[24px] bg-[#E1E1E1] border border-[#BBBBBB] px-[16px] py-[12px] font-['Outfit'] text-[14px] text-[#161616] outline-none focus:border-[#161616] transition-colors",
        className
      )}
    />
  )
}

type AdminButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'
type AdminButtonSize = 'sm' | 'md'

const buttonVariantClass: Record<AdminButtonVariant, string> = {
  primary: 'bg-[#161616] text-white hover:bg-[#535353]',
  secondary: 'bg-[#E1E1E1] text-[#161616] hover:bg-[#BBBBBB]',
  outline: 'border border-[#161616] bg-[#E1E1E1] text-[#161616] hover:bg-[#DCDCDC]',
  danger: 'bg-[#FF3B30] text-white hover:bg-[#D92C25]',
}

const buttonSizeClass: Record<AdminButtonSize, string> = {
  sm: 'h-[40px] px-[16px]',
  md: 'h-[48px] px-[24px]',
}

export function AdminButton({
  variant = 'primary',
  size = 'md',
  className,
  type,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant
  size?: AdminButtonSize
}) {
  return (
    <button
      {...props}
      type={type ?? 'button'}
      className={cx(
        "rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-colors whitespace-nowrap inline-flex items-center justify-center",
        buttonSizeClass[size],
        buttonVariantClass[variant],
        props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : null,
        className
      )}
    />
  )
}

export function AdminButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children,
  ...props
}: Omit<LinkProps, 'href'> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: LinkProps['href']
    variant?: AdminButtonVariant
    size?: AdminButtonSize
    className?: string
    children: ReactNode
  }) {
  return (
    <Link
      href={href}
      className={cx(
        "rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-colors whitespace-nowrap inline-flex items-center justify-center",
        buttonSizeClass[size],
        buttonVariantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

export function AdminBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center h-[22px] px-[10px] rounded-[100px] bg-[#E1E1E1] border border-[#BBBBBB] font-['Outfit'] text-[10px] uppercase tracking-[0.6px] text-[#161616]",
        className
      )}
    >
      {children}
    </span>
  )
}

export function AdminSectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cx(
        "font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] leading-none tracking-[-1.28px] text-[#161616]",
        className
      )}
    >
      {children}
    </h2>
  )
}

export function AdminSubTabs<T extends string>({
  value,
  onChange,
  tabs,
  className,
}: {
  value: T
  onChange: (value: T) => void
  tabs: Array<{ value: T; label: string }>
  className?: string
}) {
  return (
    <div className={cx('flex gap-[8px] border-b border-[#E1E1E1] overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cx(
              "px-[24px] py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] transition-colors whitespace-nowrap",
              isActive ? 'border-b-2 border-[#161616] text-[#161616]' : 'text-[#7C7C7C] hover:text-[#161616]'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
