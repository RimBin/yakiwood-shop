'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string;
  labels?: string[];
  colors?: { id: string; image: string; name: string }[];
  selectedColorIndex?: number;
  className?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  description,
  image,
  labels = [],
  colors = [],
  selectedColorIndex = 1,
  className = '',
}: ProductCardProps) {
  return (
    <Link 
      href={`/products/${slug}`}
      className={`bg-[#eaeaea] rounded-[8px] flex flex-col gap-[24px] items-center pt-[24px] pb-[40px] px-[24px] relative group hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square max-w-[395px]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover rounded-[4px]"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-[16px] items-start w-full">
        {/* Labels/Chips */}
        {labels.length > 0 && (
          <div className="flex gap-[8px] items-center flex-wrap">
            {labels.map((label, index) => (
              <span
                key={index}
                className="bg-white/40 rounded-[4px] px-[8px] py-[6px] font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Title and Price */}
        <div className="flex flex-col gap-[8px] w-full">
          <div className="flex items-start justify-between w-full">
            <h3 className="font-['DM_Sans'] font-normal text-[24px] sm:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
              {name}
            </h3>
            <span className="font-['DM_Sans'] font-normal text-[24px] sm:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
              {price} €
            </span>
          </div>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] line-clamp-3">
            {description}
          </p>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">
              Colors
            </span>
            <div className="flex gap-[8px] items-center overflow-hidden">
              {colors.map((color, index) => (
                <div 
                  key={color.id}
                  className={`relative w-[32px] h-[32px] rounded-[4px] shrink-0 ${index === selectedColorIndex ? 'ring-2 ring-[#161616] ring-offset-2' : ''}`}
                >
                  <Image
                    src={color.image}
                    alt={color.name}
                    fill
                    className="object-cover rounded-[4px]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
