'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageCover } from '@/components/shared';

type ProductCard = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl?: string | null;
  woodType?: string;
  category?: string;
};

type FilterOptions = {
  woodTypes: string[];
  categories: string[];
};

const fallbackProducts: ProductCard[] = [
  {
    id: 'demo-1',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-1',
    basePrice: 89,
    imageUrl: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462',
    woodType: 'spruce',
    category: 'cladding',
  },
  {
    id: 'demo-2',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-2',
    basePrice: 89,
    imageUrl: 'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999',
    woodType: 'larch',
    category: 'cladding',
  },
  {
    id: 'demo-3',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-3',
    basePrice: 89,
    imageUrl: 'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0',
    woodType: 'spruce',
    category: 'decking',
  },
  {
    id: 'demo-4',
    name: 'Natural shou sugi ban plank',
    slug: 'demo-4',
    basePrice: 89,
    imageUrl: 'https://www.figma.com/api/mcp/asset/96c4c940-c49c-4bd3-8823-483555dc24ba',
    woodType: 'larch',
    category: 'furniture',
  },
];

const fallbackFilterOptions: FilterOptions = {
  woodTypes: Array.from(new Set(fallbackProducts.map((item) => item.woodType).filter(Boolean))) as string[],
  categories: Array.from(new Set(fallbackProducts.map((item) => item.category).filter(Boolean))) as string[],
};

const woodLabelMap: Record<string, string> = {
  spruce: 'Eglė',
  larch: 'Maumedis',
  oak: 'Ąžuolas',
};

const categoryLabelMap: Record<string, string> = {
  cladding: 'Fasadai',
  decking: 'Terasos',
  furniture: 'Baldai',
};

const getWoodLabel = (value: string) => (value === 'all' ? 'Visos medienos' : woodLabelMap[value] || value);
const getCategoryLabel = (value: string) => (value === 'all' ? 'Visos kategorijos' : categoryLabelMap[value] || value);

export default function ProductsPage() {
  const [activeWood, setActiveWood] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(fallbackFilterOptions);

  const fetchProducts = useCallback(
    async (woodType: string, categoryFilter: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (woodType !== 'all') params.set('woodType', woodType);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        const query = params.toString();
        const response = await fetch(`/api/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || []);
          if (data.filters) {
            setFilterOptions({
              woodTypes: data.filters.woodTypes || [],
              categories: data.filters.categories || [],
            });
          }
        } else {
          setError(data.error || 'Nepavyko gauti produktų');
          setProducts(fallbackProducts);
          setFilterOptions(fallbackFilterOptions);
        }
      } catch (err) {
        setError('Nepavyko gauti produktų');
        setProducts(fallbackProducts);
        setFilterOptions(fallbackFilterOptions);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(activeWood, activeCategory);
  }, [activeWood, activeCategory, fetchProducts]);

  const headingText = activeCategory !== 'all' ? getCategoryLabel(activeCategory) : getWoodLabel(activeWood);

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Cover */}
      <PageCover>
        <div className="flex items-start gap-[8px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {headingText}
          </h1>
          <p
            className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-0.72px] md:tracking-[-1.28px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            ({products.length})
          </p>
        </div>
        {error && <p className="text-[#F63333] text-[12px] mt-2">{error}</p>}
      </PageCover>

      {/* Filters */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[24px]">
        <div className="flex flex-col gap-[16px]">
          <div>
            <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] mb-[8px]">
              Medienos tipas
            </p>
            <div className="flex gap-[8px] items-center flex-wrap">
              {['all', ...filterOptions.woodTypes].map((value) => (
                <button
                  key={`wood-${value}`}
                  onClick={() => setActiveWood(value)}
                  className={`h-[32px] px-[12px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.3] transition-colors ${
                    activeWood === value
                      ? 'bg-[#161616] text-white'
                      : 'border border-[#BBBBBB] bg-transparent text-[#161616] hover:border-[#161616]'
                  }`}
                >
                  {getWoodLabel(value)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] mb-[8px]">
              Kategorija
            </p>
            <div className="flex gap-[8px] items-center flex-wrap">
              {['all', ...filterOptions.categories].map((value) => (
                <button
                  key={`category-${value}`}
                  onClick={() => setActiveCategory(value)}
                  className={`h-[32px] px-[12px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.3] transition-colors ${
                    activeCategory === value
                      ? 'bg-[#161616] text-white'
                      : 'border border-[#BBBBBB] bg-transparent text-[#161616] hover:border-[#161616]'
                  }`}
                >
                  {getCategoryLabel(value)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[80px]">
        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-[#161616]">Kraunama...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[16px] md:gap-x-[19px] gap-y-[40px] md:gap-y-[56px]">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                className="flex flex-col gap-[8px] group"
              >
                <div className="relative w-full h-[250px] border border-[#161616] border-opacity-30 overflow-hidden bg-white">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#535353] text-sm">
                      No image
                    </div>
                  )}
                </div>
                <p
                  className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] text-[#161616] tracking-[-0.36px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {product.name}
                </p>
                <p
                  className="font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#535353] tracking-[-0.32px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  From €{product.basePrice?.toFixed(2) ?? '0.00'}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="flex justify-center mt-[64px]">
          <button
            onClick={() => fetchProducts(activeWood, activeCategory)}
            className="h-[48px] px-[40px] py-[10px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity"
          >
            Load more
          </button>
        </div>
      </div>
    </section>
  );
}
