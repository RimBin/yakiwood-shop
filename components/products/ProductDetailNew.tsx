'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import type { Product } from '@/lib/products';

interface ProductDetailNewProps {
  product: Product;
}

// Profile component variants
const profiles = [
  { id: 'half-taper', name: 'Half taper 45°', icon: 'M0 11L35 0V11H70V0L35 11V11' },
  { id: 'taper', name: 'Taper', icon: 'M0 11L35 0L70 11H0Z' },
  { id: 'rectangle', name: 'Rectangle', icon: 'M0 0H70V11H0V0Z' },
  { id: 'rhombus', name: 'Rhombus', icon: 'M35 0L70 5.5L35 11L0 5.5L35 0Z' },
];

export default function ProductDetailNew({ product }: ProductDetailNewProps) {
  const [selectedWidth, setSelectedWidth] = useState('95 mm');
  const [selectedLength, setSelectedLength] = useState('4000 mm');
  const [selectedColor, setSelectedColor] = useState('carbon-light');
  const [selectedProfile, setSelectedProfile] = useState('taper');
  const [quantity, setQuantity] = useState(200);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('maintenance');

  const addItem = useCartStore(state => state.addItem);

  // Sample images (replace with actual product images)
  const productImages = [
    product.image || '/assets/imgSpruce.png',
    '/assets/imgLarch1.png',
    '/assets/imgLarch2.png',
  ];

  // Color swatches (this should come from product data)
  const colors = [
    { id: 'natural', name: 'Natural', image: '/assets/imgColor1.png' },
    { id: 'carbon-light', name: 'Carbon Light', image: '/assets/imgColor2.png' },
    { id: 'carbon-dark', name: 'Carbon Dark', image: '/assets/imgColor3.png' },
    { id: 'brown', name: 'Brown', image: '/assets/imgColor4.png' },
    { id: 'graphite', name: 'Graphite', image: '/assets/imgColor5.png' },
    { id: 'latte', name: 'Latte', image: '/assets/imgColor6.png' },
    { id: 'silver', name: 'Silver', image: '/assets/imgColor7.png' },
    { id: 'white', name: 'White', image: '/assets/imgColor8.png' },
  ];

  const accordionItems = [
    {
      id: 'maintenance',
      title: 'PRODUCT MAINTENANCE',
      content:
        'Every situation is unique, so if you have any questions about maintenance, we encourage you to contact us so that we can assess your needs and offer the most appropriate solution.',
    },
    {
      id: 'disclaimer',
      title: 'COLOR DISCLAIMER',
      content: 'Colors may vary slightly from the images shown due to monitor settings and natural wood variations.',
    },
    {
      id: 'shipping',
      title: 'SHIPPING & RETURN',
      content: 'Free shipping on orders over 500€. Returns accepted within 14 days of delivery.',
    },
    {
      id: 'payment',
      title: 'PAYMENT',
      content: 'We accept all major credit cards, PayPal, and bank transfers.',
    },
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      quantity: quantity,
    });
  };

  return (
    <div className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-[40px] py-[10px] border-b border-[#BBBBBB]">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-[#7C7C7C]">
          <Link href="/" className="hover:text-[#161616]">Home</Link>
          {' / '}
          <Link href="/produktai" className="hover:text-[#161616]">Shop</Link>
          {' / '}
          <span className="text-[#161616]">{product.name}</span>
        </p>
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1440px] mx-auto px-[40px] py-[54px]">
        <div className="grid grid-cols-[80px_790px_1fr] gap-[16px]">
          {/* Thumbnail Gallery - Left */}
          <div className="flex flex-col gap-[12px]">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-[80px] h-[80px] rounded-[4px] overflow-hidden ${
                  activeImage === idx ? 'ring-2 ring-[#161616]' : ''
                }`}
              >
                <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image - Center */}
          <div className="relative bg-[#BBAB92] h-[729px] rounded-[8px] overflow-hidden">
            <Image
              src={productImages[activeImage]}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Product Info - Right */}
          <div className="flex flex-col gap-[24px]">
            {/* Title & Price */}
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-['DM_Sans'] text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {product.name}
              </h1>
              <p className="font-['DM_Sans'] text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {product.basePrice} €
              </p>
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] max-w-[434px]">
              {product.shortDescription || product.description}
            </p>

            {/* Width Selector */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
                overall width (mm)
              </p>
              <div className="flex gap-[8px]">
                {['95 mm', '120 mm', '145 mm'].map((width) => (
                  <button
                    key={width}
                    onClick={() => setSelectedWidth(width)}
                    className={`relative h-[48px] w-[114px] flex items-center justify-center ${
                      selectedWidth === width
                        ? 'bg-[#161616] text-white'
                        : 'border border-[#BBBBBB] text-[#161616]'
                    }`}
                  >
                    <span className="font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase">
                      {width}
                    </span>
                    {selectedWidth === width && (
                      <div className="absolute top-[4px] right-[4px] w-[12px] h-[12px]">
                        <svg viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3.375 6.75L5.25 8.625L9.375 3.375"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selector */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
                length (mm)
              </p>
              <div className="flex gap-[8px]">
                {['3000 mm', '3600 mm', '4000 mm'].map((length) => (
                  <button
                    key={length}
                    onClick={() => setSelectedLength(length)}
                    className={`relative h-[48px] w-[114px] flex items-center justify-center ${
                      selectedLength === length
                        ? 'bg-[#161616] text-white'
                        : 'border border-[#BBBBBB] text-[#161616]'
                    }`}
                  >
                    <span className="font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase">
                      {length}
                    </span>
                    {selectedLength === length && (
                      <div className="absolute top-[4px] right-[4px] w-[12px] h-[12px]">
                        <svg viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3.375 6.75L5.25 8.625L9.375 3.375"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
                <span className="text-[#7C7C7C]">Color:</span>
                <span className="text-[#161616]">carbon light</span>
              </div>
              <div className="flex gap-[8px] flex-wrap max-h-[43px] overflow-hidden">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`relative w-[32px] h-[32px] rounded-[4px] overflow-hidden ${
                      selectedColor === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                    }`}
                  >
                    <Image src={color.image} alt={color.name} width={32} height={32} className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Selector */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
                Profile
              </p>
              <div className="flex gap-[8px]">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`relative h-[48px] w-[83px] flex items-center justify-center ${
                      selectedProfile === profile.id
                        ? 'bg-[#161616]'
                        : 'border border-[#BBBBBB]'
                    }`}
                  >
                    <svg
                      viewBox="0 0 70 15"
                      className="w-[70px] h-[15px]"
                      fill="none"
                      stroke={selectedProfile === profile.id ? 'white' : '#161616'}
                      strokeWidth="1"
                    >
                      <path d={profile.icon} />
                    </svg>
                    {selectedProfile === profile.id && (
                      <div className="absolute top-[4px] right-[4px] w-[12px] h-[12px]">
                        <svg viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3.375 6.75L5.25 8.625L9.375 3.375"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
                Quantity m2
              </p>
              <div className="border border-[#BBBBBB] h-[48px] px-[16px] py-[8px] flex items-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] text-center text-[#535353]">
                Haven't found what you've looking for?{' '}
                <Link href="/kontaktai" className="text-[#161616] underline">
                  Contact us
                </Link>
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:bg-[#2d2d2d] transition-colors"
              >
                add to cart
              </button>
            </div>
          </div>
        </div>

        {/* Accordion Section */}
        <div className="mt-[75px] max-w-[672px] mx-auto">
          <div className="flex flex-col gap-[8px]">
            {accordionItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <div className="h-[1px] bg-[#BBBBBB]" />}
                <div className="flex flex-col gap-[4px]">
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === item.id ? '' : item.id)}
                    className="flex items-center justify-between py-[8px]"
                  >
                    <span className="font-['Outfit'] font-medium text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                      {item.title}
                    </span>
                    <div className="w-[20px] h-[20px]">
                      {expandedAccordion === item.id ? (
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M5 10H15" stroke="#161616" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M10 5V15M5 10H15" stroke="#161616" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {expandedAccordion === item.id && (
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] pb-[8px] max-w-[494px]">
                      {item.content}
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))}
            <div className="h-[1px] bg-[#BBBBBB]" />
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-[119px]">
          <div className="flex items-center justify-between mb-[32px]">
            <h2 className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616]">
              Related products
            </h2>
            <Link
              href="/produktai"
              className="flex items-center gap-[8px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:opacity-70 transition-opacity"
            >
              View all products
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Related products grid would go here */}
          <div className="grid grid-cols-3 gap-[16px]">
            {/* Placeholder for related products */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#EAEAEA] rounded-[8px] p-[24px] h-[618px]">
                <div className="bg-[#BBBBBB] h-[311px] rounded-[4px] mb-[24px]" />
                <div className="space-y-[16px]">
                  <div className="flex gap-[8px]">
                    {['Facades', 'Fence', 'Terrace'].map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/40 px-[8px] py-[4px] rounded-[4px] font-['Outfit'] font-normal text-[10px] tracking-[0.5px] uppercase text-[#161616]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between mb-[8px]">
                      <h3 className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                        Product {i}
                      </h3>
                      <span className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                        89 €
                      </span>
                    </div>
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                      Product description goes here...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
