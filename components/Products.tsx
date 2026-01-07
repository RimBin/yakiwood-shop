'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart/store';
import { assets, getAsset } from '@/lib/assets';

const imgMask = getAsset('imgMask');

// Product images
const imgSpruce = assets.wood.spruce;
const imgLarch1 = assets.wood.larch1;
const imgLarch2 = assets.wood.larch2;

// Color swatches
const [
  imgColor1,
  imgColor2,
  imgColor3,
  imgColor4,
  imgColor5,
  imgColor6,
  imgColor7,
  imgColor8,
] = assets.colors;

// Product type
type ProductData = {
  id: string;
  image: string;
  title: string;
  price: number;
  description: string;
  solutions: string[];
};

const products: ProductData[] = [
  {
    id: 'spruce-wood',
    image: imgSpruce,
    title: 'Spruce wood',
    price: 89,
    description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
    solutions: ['Facades', 'Fence', 'Terrace', 'Interior']
  },
  {
    id: 'larch-wood-1',
    image: imgLarch1,
    title: 'Larch wood',
    price: 89,
    description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
    solutions: ['Facades', 'Fence', 'Terrace', 'Interior']
  },
  {
    id: 'larch-wood-2',
    image: imgLarch2,
    title: 'Spruce wood',
    price: 89,
    description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
    solutions: ['Facades', 'Fence', 'Terrace', 'Interior']
  }
];

// Mobile Product Card - Figma 803:13034 (303x532px)
function MobileProductCard({ product }: { product: ProductData }) {
  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[12px] pb-[16px] px-[12px] w-[303px] md:w-[360px] flex-shrink-0 flex flex-col gap-[24px] items-center relative">
      {/* Background mask overlay */}
      <div className="absolute left-0 top-0 w-[303px] h-[532px] pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>
      
      {/* Product image - 271x260px on mobile */}
      <div className="relative w-[271px] h-[260px] shrink-0 z-10 rounded-[8px] overflow-hidden">
        <Image src={product.image} alt={product.title} fill className="object-cover" />
      </div>
      
      {/* Content container - 279px width */}
      <div className="w-[279px] flex flex-col gap-[16px] relative z-10">
        {/* Solution chips */}
        <div className="flex gap-[8px] items-center justify-start flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">
                {sol}
              </p>
            </div>
          ))}
        </div>
        
        {/* Title & Price row */}
        <div className="flex items-center justify-between w-full">
          <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
            {product.title}
          </p>
          <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
            {product.price} €
          </p>
        </div>
        
        {/* Description */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full">
          {product.description}
        </p>
        
        {/* Colors section */}
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">Colors</p>
          <div className="flex flex-wrap gap-[12px] items-center">
            {[imgColor1, imgColor2, imgColor3, imgColor4, imgColor5, imgColor6, imgColor7, imgColor8].map((src, idx) => (
              <div key={idx} className="rounded-[4px] w-[24px] h-[24px] relative overflow-hidden flex items-center justify-center">
                <Image src={src} alt="" width={20} height={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Product Card
function DesktopProductCard({ product }: { product: ProductData }) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      slug: product.id,
      basePrice: product.price,
    });
  };

  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[24px] pb-[40px] px-[24px] w-[443px] flex flex-col gap-[24px] items-center relative shrink-0">
      <div className="absolute left-0 top-0 w-[443px] h-[618px] pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>
      
      <div className="relative w-[395px] h-[311px] shrink-0 z-10">
        <Image src={product.image} alt={product.title} fill className="object-cover" />
      </div>
      
      <div className="w-[383px] flex flex-col gap-[16px] relative z-10">
        <div className="flex gap-[8px] items-center justify-center flex-wrap">
          {product.solutions.map((sol, idx) => (
            <div key={idx} className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]">
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{sol}</p>
            </div>
          ))}
        </div>
        
        <div className="flex items-start justify-between w-full leading-[1.1] font-['DM_Sans'] font-normal text-[32px] tracking-[-1.28px] text-[#161616]">
          <p className="shrink-0">{product.title}</p>
          <p className="shrink-0">{product.price} €</p>
        </div>
        
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[354px]">
          {product.description}
        </p>
        
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">Colors</p>
          <div className="flex gap-[8px] items-center overflow-clip">
            {[imgColor1, imgColor2, imgColor4, imgColor5, imgColor6, imgColor7, imgColor8].map((src, idx) => (
              <div key={idx} className="rounded-[4px] w-[32px] h-[32px] relative flex items-center justify-center">
                <Image src={src} alt="" width={32} height={32} />
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full mt-[8px] py-[12px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] hover:bg-[#535353] transition-colors"
        >
          Pridėti į krepšelį
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full bg-[#E1E1E1]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 803:13029 ===== */}
      <div className="lg:hidden">
        {/* Title Section - Mobile */}
        <div className="px-[16px] pt-[64px] pb-[24px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
            products
          </p>
          <p className="font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616] w-[358px]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic">perfect</span>
            <span> wood finish</span>
          </p>
        </div>

        {/* Horizontal scrolling product cards - Figma 803:13033 */}
        <div 
          ref={scrollRef}
          className="flex gap-[8px] overflow-x-auto px-[16px] pb-[24px] scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, idx) => (
            <div key={idx} style={{ scrollSnapAlign: 'start' }}>
              <MobileProductCard product={product} />
            </div>
          ))}
        </div>

        {/* GET AN OFFER Button - Mobile */}
        <div className="px-[16px] pb-[64px]">
          <button className="w-[358px] max-w-full mx-auto block bg-[#161616] rounded-[100px] h-[48px] flex items-center justify-center">
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              get an offer
            </span>
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] relative">
        {/* Title Section */}
        <div className="absolute left-[40px] top-[0px] text-[#161616] z-10">
          <p className="absolute font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase left-[0px] top-[23px]">
            products
          </p>
          <p className="absolute font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] left-[344px] top-[0px] w-[692px]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">perfect</span>
            <span> wood finish</span>
          </p>
        </div>

        {/* Products Grid */}
        <div className="absolute left-[calc(50%+0.5px)] top-[218px] -translate-x-1/2 flex gap-[16px] items-center">
          {products.map((product, idx) => (
            <DesktopProductCard key={idx} product={product} />
          ))}
        </div>

        {/* View Catalog Button */}
        <div className="absolute left-[calc(50%-1px)] top-[906px] -translate-x-1/2 bg-[#161616] px-[40px] py-[10px] h-[48px] rounded-[100px] w-[296px] flex items-center justify-center gap-[10px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
            view catalog
          </p>
        </div>

        <div className="h-[975px]" />
      </div>
    </section>
  );
}
