'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageCover } from '@/components/shared';

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Product data - replace with real data from your database
  const allProducts = [
    { id: 1, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462', category: 'spruce' },
    { id: 2, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999', category: 'larch' },
    { id: 3, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0', category: 'spruce' },
    { id: 4, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/96c4c940-c49c-4bd3-8823-483555dc24ba', category: 'larch' },
    { id: 5, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/b2f01ae8-4b24-4a8e-8e4a-dcc7e204799e', category: 'spruce' },
    { id: 6, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/a63a50db-9783-401a-a38d-9d761b777b3a', category: 'larch' },
    { id: 7, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/3213bf57-d148-4e08-bc04-31ee1e520d0e', category: 'spruce' },
    { id: 8, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/726192c2-b363-4874-95df-da5b529c98d3', category: 'larch' },
    { id: 9, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462', category: 'spruce' },
    { id: 10, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999', category: 'larch' },
    { id: 11, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0', category: 'spruce' },
    { id: 12, name: 'Natural shou sugi ban plank', price: 89, image: 'https://www.figma.com/api/mcp/asset/96c4c940-c49c-4bd3-8823-483555dc24ba', category: 'larch' },
  ];

  const filters = [
    { id: 'all', label: 'All woods' },
    { id: 'spruce', label: 'Spruce wood' },
    { id: 'larch', label: 'Larch wood' },
  ];

  const products = activeFilter === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeFilter);

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
              href={`/products/${product.id}`}
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
