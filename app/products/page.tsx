'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageCover } from '@/components/shared';
import { fetchProducts, type Product } from '@/lib/products.supabase';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { applyRoleDiscount, type RoleDiscount } from '@/lib/pricing/roleDiscounts';
import { toLocalePath } from '@/i18n/paths';

export default function ProductsPage() {
  const t = useTranslations('productsPage');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const [activeUsage, setActiveUsage] = useState<'all' | string>('all');
  const [activeWood, setActiveWood] = useState<'all' | string>('all');
  const [activeColor, setActiveColor] = useState<'all' | string>('all');
  const [activeProfile, setActiveProfile] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        console.log('Loading products from Sanity...');
        const products = await fetchProducts();
        console.log('Products loaded:', products.length);

        // Apply role discount for authenticated users.
        const supabase = createClient();
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();

            const role = (profile as any)?.role as string | undefined;
            if (role) {
              const { data: discountRow } = await supabase
                .from('role_discounts')
                .select('role,discount_type,discount_value,currency,is_active')
                .eq('role', role)
                .eq('is_active', true)
                .maybeSingle();

              const discount = (discountRow as RoleDiscount | null) ?? null;
              if (discount) {
                setAllProducts(
                  products.map((p) => ({
                    ...p,
                    price: applyRoleDiscount(p.price, discount),
                  }))
                );
              } else {
                setAllProducts(products);
              }
            } else {
              setAllProducts(products);
            }
          } else {
            setAllProducts(products);
          }
        } else {
          setAllProducts(products);
        }
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const usageFilters = useMemo(
    () => [
      { id: 'all', label: t('usageFilters.all') },
      { id: 'facade', label: t('usageFilters.facade') },
      { id: 'terrace', label: t('usageFilters.terrace') },
      { id: 'interior', label: t('usageFilters.interior') },
      { id: 'fence', label: t('usageFilters.fence') },
    ],
    [t]
  );

  const woodFilters = useMemo(
    () => [
      { id: 'all', label: t('woodFilters.all') },
      { id: 'spruce', label: t('woodFilters.spruce') },
      { id: 'larch', label: t('woodFilters.larch') },
    ],
    [t]
  );

  const usageLabels: Record<string, string> = useMemo(() => {
    return {
      facade: t('usageFilters.facade'),
      terrace: t('usageFilters.terrace'),
      interior: t('usageFilters.interior'),
      fence: t('usageFilters.fence'),
    };
  }, [t]);

  const woodLabels: Record<string, string> = useMemo(() => {
    return {
      spruce: t('woodFilters.spruce'),
      larch: t('woodFilters.larch'),
    };
  }, [t]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const product of allProducts) {
      for (const color of product.colors ?? []) {
        if (color?.name) set.add(color.name);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const profileOptions = useMemo(() => {
    const set = new Set<string>();
    for (const product of allProducts) {
      for (const profile of product.profiles ?? []) {
        if (profile?.name) set.add(profile.name);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const products = allProducts.filter((product) => {
    const matchesUsage = activeUsage === 'all' || product.category === activeUsage;
    const matchesWood = activeWood === 'all' || product.woodType === activeWood;
    const matchesColor =
      activeColor === 'all' ||
      (product.colors ?? []).some((c) => (c?.name ?? '').toLowerCase() === activeColor.toLowerCase());
    const matchesProfile =
      activeProfile === 'all' ||
      (product.profiles ?? []).some((p) => (p?.name ?? '').toLowerCase() === activeProfile.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = q.length === 0 || product.name.toLowerCase().includes(q);
    return matchesUsage && matchesWood && matchesColor && matchesProfile && matchesQuery;
  });

  const activeUsageLabel = usageFilters.find((filter) => filter.id === activeUsage)?.label ?? usageFilters[0].label;

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Cover */}
      <PageCover>
        <div className="flex items-start gap-[8px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {activeUsageLabel}
          </h1>
          <p
            className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-0.72px] md:tracking-[-1.28px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            ({products.length})
          </p>
        </div>
      </PageCover>

      {/* Filters */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[24px]">
        <div className="flex flex-col gap-4">
          <div className="w-full max-w-[520px]">
            <label className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
              {t('searchLabel')}
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-[40px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:max-w-[360px]">
              <label className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('colorFilterLabel')}
              </label>
              <select
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white yw-select"
              >
                <option value="all">{t('colorFilterAll')}</option>
                {colorOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:max-w-[360px]">
              <label className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('profileFilterLabel')}
              </label>
              <select
                value={activeProfile}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white yw-select"
              >
                <option value="all">{t('profileFilterAll')}</option>
                {profileOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-[8px] items-center flex-wrap">
            {usageFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveUsage(filter.id)}
                className={`h-[32px] px-[12px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.3] transition-colors ${
                  activeUsage === filter.id
                    ? 'bg-[#161616] text-white'
                    : 'border border-[#BBBBBB] bg-transparent text-[#161616] hover:border-[#161616]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex gap-[8px] items-center flex-wrap">
            {woodFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveWood(filter.id)}
                className={`h-[28px] px-[12px] rounded-[100px] font-['Outfit'] text-[11px] tracking-[0.5px] uppercase leading-[1.3] transition-colors ${
                  activeWood === filter.id
                    ? 'bg-[#161616] text-white'
                    : 'border border-[#BBBBBB] bg-transparent text-[#161616] hover:border-[#161616]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[80px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161616]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-xl font-medium text-[#161616] mb-2">
              {t('errorTitle')}
            </h3>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-2">
              {error}
            </p>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-6">
              {t('errorHelp')}{' '}
              <Link href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('errorContactLink')}
              </Link>{' '}
              {t('errorContactSuffix')}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-[#161616] text-white rounded-full hover:opacity-90"
            >
              {t('retry')}
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EAEAEA] rounded-full mb-4">
              <svg className="w-8 h-8 text-[#BBBBBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-xl font-medium text-[#161616] mb-2">
              {t('emptyTitle')}
            </h3>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-6">
              {t('emptyDescriptionPrefix')}{' '}
              <Link href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('emptyContactLink')}
              </Link>
              {t('emptyDescriptionSuffix')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[16px] md:gap-x-[19px] gap-y-[40px] md:gap-y-[56px]">
            {products.map((product) => (
            <Link
              key={product.id}
              href={toLocalePath(`/products/${product.slug}`, currentLocale)}
              data-testid="product-card"
              className="flex flex-col gap-[8px] group"
            >
              <div className="relative w-full h-[250px] border border-[#161616] border-opacity-30 overflow-hidden">
                <Image
                  src={product.image || '/images/ui/wood/imgSpruce.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <p
                className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] text-[#161616] tracking-[-0.36px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {product.name}
              </p>
              {(product.category || product.woodType) && (
                <p
                  className="font-['DM_Sans'] font-normal text-[14px] leading-[1.2] text-[#535353] tracking-[-0.28px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {[
                    product.category ? (usageLabels[product.category] ?? product.category) : undefined,
                    product.woodType ? (woodLabels[product.woodType] ?? product.woodType) : undefined,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              )}
              <p
                className="font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#535353] tracking-[-0.32px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {t('fromPrice', { price: product.price.toFixed(0) })}
              </p>
            </Link>
          ))}
          </div>
        )}

        {/* Load More Button - only show if there are products */}
        {!isLoading && products.length > 0 && (
          <div className="flex justify-center mt-[64px]">
            <button className="h-[48px] px-[40px] py-[10px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity">
              {t('loadMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
