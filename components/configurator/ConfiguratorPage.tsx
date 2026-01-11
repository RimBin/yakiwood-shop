'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageCover, PageSection } from '@/components/shared';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import { fetchProducts, type Product, type ProductColorVariant, type ProductProfileVariant } from '@/lib/products.supabase';
import { toLocalePath } from '@/i18n/paths';

const FALLBACK_COLORS: ProductColorVariant[] = [
  { id: 'demo-black', name: 'Black', hex: '#161616', priceModifier: 0 },
  { id: 'demo-charcoal', name: 'Charcoal', hex: '#535353', priceModifier: 0 },
  { id: 'demo-natural', name: 'Natural', hex: '#BBBBBB', priceModifier: 0 },
];

const FALLBACK_PROFILES: ProductProfileVariant[] = [
  { id: 'demo-standard', name: 'Standard', description: 'Standard profile', priceModifier: 0 },
  { id: 'demo-premium', name: 'Premium', description: 'Premium profile', priceModifier: 0 },
];

export default function ConfiguratorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeUsage, setActiveUsage] = useState<'all' | string>('all');
  const [activeWood, setActiveWood] = useState<'all' | string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const products = await fetchProducts();
        if (!isMounted) return;
        setAllProducts(products);
        const nextProduct = products[0] ?? null;
        setProduct(nextProduct);
        setSelectedProductId(nextProduct?.id ?? null);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load products');
        setProduct(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const usageFilters = useMemo(
    () => [
      { id: 'all', label: t('productsPage.usageFilters.all') },
      { id: 'facade', label: t('productsPage.usageFilters.facade') },
      { id: 'terrace', label: t('productsPage.usageFilters.terrace') },
    ],
    [t]
  );

  const woodFilters = useMemo(
    () => [
      { id: 'all', label: t('productsPage.woodFilters.all') },
      { id: 'spruce', label: t('productsPage.woodFilters.spruce') },
      { id: 'larch', label: t('productsPage.woodFilters.larch') },
    ],
    [t]
  );

  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchesUsage = activeUsage === 'all' || item.category === activeUsage;
      const matchesWood = activeWood === 'all' || item.woodType === activeWood;
      return matchesUsage && matchesWood;
    });
  }, [allProducts, activeUsage, activeWood]);

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setProduct(null);
      setSelectedProductId(null);
      return;
    }

    const next = filteredProducts.find((item) => item.id === selectedProductId) ?? filteredProducts[0];

    if (next && next.id !== selectedProductId) {
      setSelectedProductId(next.id);
    }

    if (next && next.id !== product?.id) {
      setProduct(next);
    }
  }, [filteredProducts, product?.id, selectedProductId]);

  const availableColors = useMemo(() => {
    const colors = product?.colors ?? [];
    return colors.length > 0 ? colors : FALLBACK_COLORS;
  }, [product]);

  const availableFinishes = useMemo(() => {
    const profiles = product?.profiles ?? [];
    return profiles.length > 0 ? profiles : FALLBACK_PROFILES;
  }, [product]);

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <PageCover>
        <div className="flex flex-col gap-[12px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {t('configurator.pageTitle')}
          </h1>
          <p className="max-w-[820px] font-['Outfit'] text-[14px] md:text-[16px] leading-[1.6] text-[#535353]">
            {t('configurator.pageDescription')}
          </p>
        </div>
      </PageCover>

      <PageSection className="max-w-[1440px] mx-auto" centered={false}>
        <div className="flex flex-col gap-4 mb-8">
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
          {filteredProducts.length > 1 && (
            <div className="w-full max-w-[420px]">
              <label className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('breadcrumbs.products')}
              </label>
              <select
                value={selectedProductId ?? ''}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedProductId(nextId);
                  const nextProduct = filteredProducts.find((item) => item.id === nextId) ?? null;
                  setProduct(nextProduct);
                }}
                className="w-full h-[40px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white yw-select"
              >
                {filteredProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {error && (
          <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('configurator.loadError')}</p>
            <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">{error}</p>
          </div>
        )}

        {!error && filteredProducts.length === 0 && !isLoading && (
          <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('productsPage.emptyTitle')}</p>
            <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">
              {t('productsPage.emptyDescriptionPrefix')}{' '}
              <a href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('productsPage.emptyContactLink')}
              </a>
              {t('productsPage.emptyDescriptionSuffix')}
            </p>
          </div>
        )}

        {!error && (product || isLoading) && (
          <div className="w-full">
            <Konfiguratorius3D
              productId={product?.id ?? 'demo'}
              availableColors={availableColors}
              availableFinishes={availableFinishes}
              isLoading={isLoading}
            />

          </div>
        )}
      </PageSection>
    </main>
  );
}
