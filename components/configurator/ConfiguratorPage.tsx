'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageCover, PageSection } from '@/components/shared';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import { fetchProducts, type Product, type ProductColorVariant, type ProductProfileVariant } from '@/lib/products.sanity';

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

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const products = await fetchProducts();
        if (!isMounted) return;
        setProduct(products[0] ?? null);
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
        {error && (
          <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('configurator.loadError')}</p>
            <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">{error}</p>
          </div>
        )}

        {!error && (
          <div className="w-full">
            <Konfiguratorius3D
              productId={product?.id ?? 'demo'}
              availableColors={availableColors}
              availableFinishes={availableFinishes}
              isLoading={isLoading}
            />

            {!product && !isLoading && (
              <div className="mt-6 w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
                <p className="font-['Outfit'] text-[14px] text-[#535353]">
                  {t('configurator.fallbackNote')}
                </p>
              </div>
            )}
          </div>
        )}
      </PageSection>
    </main>
  );
}
