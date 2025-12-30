'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageCover } from '@/components/shared';
import { fetchProducts, Product } from '@/lib/products.sanity';

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filters = [
    { id: 'all', label: 'All woods' },
    { id: 'spruce', label: 'Spruce wood' },
    { id: 'larch', label: 'Larch wood' },
  ];

  const products =
    activeFilter === 'all'
      ? allProducts
      : allProducts.filter((p) => p.woodType === activeFilter);

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Cover */}
      <PageCover>
        <div className="flex items-start gap-[8px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            All woods
          </h1>
          <p
            className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-0.72px] md:tracking-[-1.28px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            (18)
          </p>
        </div>
      </PageCover>

      {/* Filters */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[24px]">
        <div className="flex gap-[8px] items-center flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`h-[32px] px-[12px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.3] transition-colors ${
                activeFilter === filter.id
                  ? 'bg-[#161616] text-white'
                  : 'border border-[#BBBBBB] bg-transparent text-[#161616] hover:border-[#161616]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[80px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[16px] md:gap-x-[19px] gap-y-[40px] md:gap-y-[56px]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex flex-col gap-[8px] group"
            >
              <div className="relative w-full h-[250px] border border-[#161616] border-opacity-30 overflow-hidden">
                <Image
                  src={product.image}
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
              {product.woodType && (
                <p
                  className="font-['DM_Sans'] font-normal text-[14px] leading-[1.2] text-[#535353] tracking-[-0.28px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {product.woodType === 'larch' ? 'Maumedis' : 'Eglė'}
                </p>
              )}
              <p
                className="font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#535353] tracking-[-0.32px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                From {product.price} €
              </p>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-[64px]">
          <button className="h-[48px] px-[40px] py-[10px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
}
