'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showDivider?: boolean;
  align?: 'left' | 'center' | 'right';
  containerClassName?: string;
}

export default function Breadcrumbs({ items, showDivider = true, align = 'center', containerClassName }: BreadcrumbsProps) {
  const alignmentClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center lg:text-left';

  return (
    <div className={showDivider ? 'w-full border-b border-[#BBBBBB]' : 'w-full'}>
      <div className={`max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-2.5 ${containerClassName ?? ''}`}>
        <p className={`font-['Outfit'] font-normal text-[12px] leading-[1.3] ${alignmentClass}`}>
          {items.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <Link href={item.href} className="text-[#7C7C7C] hover:text-[#161616] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#161616]">{item.label}</span>
              )}
              {index < items.length - 1 && <span className="text-[#7C7C7C]"> / </span>}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
