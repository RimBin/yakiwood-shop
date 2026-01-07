'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';
import { ColorSwatchGroup } from '@/components/ui/ColorSwatch';
import ProductCard from '@/components/ui/ProductCard';
import { assets } from '@/lib/assets';

// Local assets
const imgProduct = assets.wood.spruce;
const imgThumb1 = assets.wood.spruce;
const imgThumb2 = assets.wood.larch1;
const imgThumb3 = assets.wood.larch2;

// Profile icons SVG paths
const profiles = [
  { id: 'half-taper', name: 'Half taper 45°', path: 'M0 11L35 0V11H70V0L35 11V11' },
  { id: 'rectangle', name: 'Rectangle', path: 'M0 0H70V11H0V0Z' },
  { id: 'rhombus', name: 'Rhombus', path: 'M35 0L70 5.5L35 11L0 5.5L35 0Z' },
  { id: 'taper', name: 'Taper', path: 'M0 11L35 0L70 11H0Z' },
];

// Sample colors
const productColors = [
  { id: 'natural', name: 'Natural', image: assets.colors[0] },
  { id: 'carbon-light', name: 'Carbon Light', image: assets.colors[1] },
  { id: 'carbon-dark', name: 'Carbon Dark', image: assets.colors[2] },
  { id: 'brown', name: 'Brown', image: assets.colors[3] },
  { id: 'graphite', name: 'Graphite', image: assets.colors[4] },
  { id: 'latte', name: 'Latte', image: assets.colors[5] },
  { id: 'silver', name: 'Silver', image: assets.colors[6] },
  { id: 'white', name: 'White', image: assets.colors[7] },
];

// Accordion items
const accordionItems = [
  {
    title: 'PRODUCT MAINTENANCE',
    content: 'Every situation is unique, so if you have any questions about maintenance, we encourage you to contact us so that we can assess your needs and offer the most appropriate solution.',
  },
  { title: 'COLOR DISCLAIMER', content: 'Colors may vary slightly from the images shown due to monitor settings and natural wood variations.' },
  { title: 'SHIPPING & RETURN', content: 'Free shipping on orders over 500€. Returns accepted within 14 days of delivery.' },
  { title: 'PAYMENT', content: 'We accept all major credit cards, PayPal, and bank transfers.' },
];

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    image?: string;
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedWidth, setSelectedWidth] = useState('95');
  const [selectedLength, setSelectedLength] = useState('4000');
  const [selectedColor, setSelectedColor] = useState('carbon-light');
  const [selectedProfile, setSelectedProfile] = useState('half-taper');
  const [quantity, setQuantity] = useState(200);
  const [activeThumb, setActiveThumb] = useState(0);

  const widths = ['95', '120', '145'];
  const lengths = ['3000', '3600', '4000'];
  const thumbs = [imgThumb1, imgThumb2, imgThumb3];

  return (
    <div className="min-h-screen bg-[#E1E1E1]">

      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[10px] border-b border-[#bbbbbb]">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-[#7c7c7c]">
          <Link href="/" className="hover:text-[#161616]">Home</Link>
          {' / '}
          <Link href="/produktai" className="hover:text-[#161616]">Shop</Link>
          {' / '}
          <span className="text-[#161616]">{product.name}</span>
        </p>
      </div>

      {/* Product Section */}
      <main className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px] lg:py-[54px]">
        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[36px]">
          
          {/* Left Column - Gallery */}
          <div className="flex gap-[16px] lg:gap-[16px] order-2 lg:order-1">
            {/* Thumbnails - vertical on desktop, horizontal on mobile */}
            <div className="flex lg:flex-col gap-[12px] order-2 lg:order-1">
              {thumbs.map((thumb, index) => (
                <button
                  key={index}
                  onClick={() => setActiveThumb(index)}
                  className={`relative w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] rounded-[4px] overflow-hidden shrink-0 ${
                    activeThumb === index ? 'ring-2 ring-[#161616]' : ''
                  }`}
                >
                  <Image src={thumb} alt={`Product view ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="relative flex-1 lg:flex-none lg:w-[328px] xl:w-[500px] 2xl:w-[790px] aspect-square lg:aspect-auto lg:h-[400px] xl:h-[500px] 2xl:h-[729px] bg-[#bbab92] rounded-[4px] overflow-hidden order-1 lg:order-2">
              <Image 
                src={product.image || imgProduct} 
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="flex-1 flex flex-col gap-[24px] order-1 lg:order-2">
            {/* Title and Price */}
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-['DM_Sans'] font-normal text-[28px] lg:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {product.name}
              </h1>
              <p className="font-['DM_Sans'] font-normal text-[28px] lg:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {product.price} €
              </p>
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] max-w-[434px]">
              {product.description}
            </p>

            {/* Variants */}
            <div className="flex flex-col gap-[24px]">
              
              {/* Width */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Overall width (mm)
                </p>
                <div className="flex gap-[8px]">
                  {widths.map((width) => (
                    <button
                      key={width}
                      onClick={() => setSelectedWidth(width)}
                      className={`h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedWidth === width
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                      }`}
                    >
                      {width} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Length (mm)
                </p>
                <div className="flex gap-[8px]">
                  {lengths.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength(length)}
                      className={`h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedLength === length
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                      }`}
                    >
                      {length} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <ColorSwatchGroup
                colors={productColors}
                selectedColorId={selectedColor}
                onColorSelect={setSelectedColor}
              />

              {/* Profile */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Profile
                </p>
                <div className="flex gap-[8px]">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile.id)}
                      className={`h-[48px] w-[83px] flex items-center justify-center transition-colors ${
                        selectedProfile === profile.id
                          ? 'bg-[#161616]'
                          : 'border border-[#bbbbbb] hover:border-[#161616]'
                      }`}
                      title={profile.name}
                    >
                      <svg 
                        width="70" 
                        height="12" 
                        viewBox="0 0 70 12" 
                        fill="none"
                        className={selectedProfile === profile.id ? 'stroke-white' : 'stroke-[#161616]'}
                      >
                        <path d={profile.path} strokeWidth="1.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Quantity m2
                </p>
                <div className="h-[48px] px-[16px] border border-[#bbbbbb] flex items-center max-w-[438px]">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-[8px] items-center max-w-[434px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#535353] text-center">
                Haven't found what you're looking for?{' '}
                <Link href="/kontaktai" className="text-[#161616] underline">
                  Contact us
                </Link>
              </p>
              <Button fullWidth>Add to cart</Button>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="mt-[40px] lg:mt-[80px] max-w-[672px] mx-auto lg:mx-0 lg:ml-[344px]">
          <Accordion items={accordionItems} />
        </div>
      </main>

      {/* Related Products */}
      <section className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[40px] lg:py-[80px]">
        <div className="flex items-center justify-between mb-[24px]">
          <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-2.2px] lg:tracking-[-4.4px] text-[#161616]">
            Related products
          </h2>
          <Link 
            href="/produktai"
            className="hidden lg:flex items-center gap-[8px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:opacity-70"
          >
            View all products
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[16px]">
          {[1, 2, 3].map((i) => (
            <ProductCard
              key={i}
              id={String(i)}
              name={i === 1 ? 'Spruce wood' : 'Larch wood'}
              slug={i === 1 ? 'spruce-wood' : 'larch-wood'}
              price={89}
              description="Lightweight yet strong, this wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications."
              image={assets.wood.spruce}
              labels={['Facades', 'Terrace', 'Interior']}
              colors={productColors.slice(0, 8)}
              selectedColorIndex={1}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
