'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products.supabase';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
  href?: string;
}

export default function ProductCard({ product, href }: ProductCardProps) {
  const t = useTranslations();
  const linkHref = href || `/produktai/${product.slug}`;
  const usageLabel = useMemo(() => {
    if (!product.category) return undefined;
    const labels: Record<string, string> = {
      facade: t('productsPage.usageFilters.facade'),
      terrace: t('productsPage.usageFilters.terrace'),
    };
    return labels[product.category] || product.category;
  }, [product.category, t]);

  return (
    <Link href={linkHref} className="group block">
      <div className="relative aspect-square bg-[#EAEAEA] rounded-[24px] overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
        <Image
          src={product.image || '/images/ui/wood/imgSpruce.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        
        {/* Category badge (if available) */}
        {usageLabel && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 rounded-full font-['Outfit'] text-xs text-[#161616]">
              {usageLabel}
            </span>
          </div>
        )}

        {/* Quick view button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-4 py-2 bg-white rounded-full font-['Outfit'] text-xs text-[#161616] shadow-lg">
            {t('relatedProducts.view')}
          </span>
        </div>
      </div>
      
      <h3 className="font-['DM_Sans'] font-medium text-[#161616] mb-1 group-hover:text-[#535353] transition-colors">
        {product.name}
      </h3>
      
      {product.description && (
        <p className="font-['Outfit'] text-sm text-[#7C7C7C] mb-2 line-clamp-2">
          {product.description}
        </p>
      )}
      
      <div className="flex items-baseline gap-2">
        <span className="font-['DM_Sans'] font-medium text-lg text-[#161616]">
          €{product.price.toFixed(0)}
        </span>
        <span className="font-['Outfit'] text-xs text-[#7C7C7C]">
          {t('relatedProducts.from')}
        </span>
      </div>
    </Link>
  );
}
