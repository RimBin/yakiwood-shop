import React from 'react';
import Link from 'next/link';

interface ProjectInfoProps {
  title: string;
  subtitle?: string;
  location: string;
  productsUsed: {
    name: string;
    slug: string;
  }[];
}

export default function ProjectInfo({
  title,
  subtitle,
  location,
  productsUsed,
}: ProjectInfoProps) {
  return (
    <div className="w-full max-w-[670px] mx-auto px-4 lg:px-0">
      <div className="flex flex-col gap-4">
        {/* Divider */}
        <div className="w-full h-px bg-[#BBBBBB]" />

        {/* Title */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <p className="font-['Outfit'] font-normal text-[#7C7C7C] text-xs uppercase tracking-[0.6px] leading-[1.3] w-full lg:w-[329px]">
            Title
          </p>
          <p className="font-['Outfit'] font-normal text-[#161616] text-xs uppercase tracking-[0.6px] leading-[1.3]">
            {title}
            {subtitle && `, ${subtitle}`}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#BBBBBB]" />

        {/* Location */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <p className="font-['Outfit'] font-normal text-[#7C7C7C] text-xs uppercase tracking-[0.6px] leading-[1.3] w-full lg:w-[329px]">
            Location
          </p>
          <p className="font-['Outfit'] font-normal text-[#161616] text-xs uppercase tracking-[0.6px] leading-[1.3]">
            {location}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#BBBBBB]" />

        {/* Products Used */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <p className="font-['Outfit'] font-normal text-[#7C7C7C] text-xs uppercase tracking-[0.6px] leading-[1.3] w-full lg:w-[329px]">
            Products used
          </p>
          <div className="flex flex-wrap gap-1">
            {productsUsed.map((product, index) => (
              <React.Fragment key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="font-['Outfit'] font-normal text-[#161616] text-xs uppercase tracking-[0.6px] leading-[1.3] underline hover:no-underline transition-all"
                >
                  {product.name}
                </Link>
                {index < productsUsed.length - 1 && (
                  <span className="font-['Outfit'] font-normal text-[#161616] text-xs">,</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#BBBBBB]" />
      </div>
    </div>
  );
}
