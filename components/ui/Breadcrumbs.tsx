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
    <div className="border-b border-[#bbbbbb] px-4 lg:px-10 py-2.5">
      <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-center">
        {items.map((item, index) => (
          <span key={index}>
            {item.href ? (
              <Link href={item.href} className="text-[#7c7c7c] hover:text-[#161616] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#161616]">{item.label}</span>
            )}
            {index < items.length - 1 && <span className="text-[#7c7c7c]"> / </span>}
          </span>
        ))}
      </p>
    </div>
  );
}
