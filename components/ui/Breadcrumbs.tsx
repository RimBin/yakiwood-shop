'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="w-full border-b border-[#BBBBBB]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-2.5">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-center lg:text-left">
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
