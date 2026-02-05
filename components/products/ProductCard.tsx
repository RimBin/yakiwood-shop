'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products.supabase';
import { localizeColorLabel } from '@/lib/products.supabase';
import { useLocale, useTranslations } from 'next-intl';
import { trackSelectItem } from '@/lib/analytics';

interface ProductCardProps {
  product: Product;
  href?: string;
}

export default function ProductCard({ product, href }: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const linkHref = href || `/produktai/${product.slug}`;

  const cardTitle = useMemo(() => {
    const parsed = product.slug.includes('--') ? product.slug.split('--') : null;
    const parsedColor = parsed && parsed.length >= 3 ? parsed[2] : '';
    const colorName = product.colors?.[0]?.name ?? parsedColor ?? '';
    const colorLabel = colorName ? localizeColorLabel(colorName, currentLocale) : '';

    const woodKey = typeof product.woodType === 'string' ? product.woodType.trim().toLowerCase() : '';
    const woodLabel =
      woodKey === 'larch'
        ? currentLocale === 'lt'
          ? 'Maumedis'
          : 'Larch'
        : woodKey === 'spruce'
          ? currentLocale === 'lt'
            ? 'Eglė'
            : 'Spruce'
          : product.woodType ?? '';

    const title = [colorLabel, woodLabel].filter(Boolean).join(' ');
    return title || (currentLocale === 'en' && product.nameEn ? product.nameEn : product.name);
  }, [product.slug, product.colors, product.woodType, product.name, product.nameEn, currentLocale]);
  const attributeLabel = useMemo(() => {
    if (!product.slug.includes('--')) return '';
    const parts = product.slug.split('--');
    if (parts.length < 4) return '';
    const [, profile, , size] = parts;
    const profileSuffix = currentLocale === 'lt' ? 'Profilis' : 'Profile';
    const sizeLabel = size ? `${size.replace(/x/gi, '×')} mm` : '';
    const profileLabel = profile ? `${profile} ${profileSuffix}` : '';
    return [profileLabel, sizeLabel].filter(Boolean).join(' · ');
  }, [product.slug, currentLocale]);
  const usageLabel = useMemo(() => {
    if (!product.category) return undefined;
    const labels: Record<string, string> = {
      facade: t('productsPage.usageFilters.facade'),
      terrace: t('productsPage.usageFilters.terrace'),
    };
    const fallback = product.category.trim();
    return labels[product.category] || (fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : product.category);
  }, [product.category, t]);

  return (
    <Link
      href={linkHref}
      className="group block"
      onClick={() => {
        trackSelectItem({
          id: product.id,
          name: cardTitle,
          price: product.price,
          category: product.category,
        });
      }}
    >
      <div className="relative aspect-square bg-[#EAEAEA] rounded-[24px] overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
        <Image
          src={product.image || '/images/ui/wood/imgSpruce.png'}
          alt={cardTitle}
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
        {cardTitle}
      </h3>
      {attributeLabel ? (
        <p className="font-['Outfit'] text-xs text-[#7C7C7C] mb-1 uppercase tracking-[0.6px]">
          {attributeLabel}
        </p>
      ) : null}
      
      {product.description && (
        <p className="font-['Outfit'] text-sm text-[#7C7C7C] mb-2 line-clamp-2">
          {product.description}
        </p>
      )}
      
      <div className="flex items-baseline gap-2">
        <span className="font-['DM_Sans'] font-medium text-lg text-[#161616]">
          {currentLocale === 'lt' ? `${product.price.toFixed(0)} €` : `€${product.price.toFixed(0)}`}
        </span>
      </div>
    </Link>
  );
}
