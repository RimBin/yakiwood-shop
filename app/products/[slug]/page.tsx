'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [selectedWidth, setSelectedWidth] = useState('95');
  const [selectedLength, setSelectedLength] = useState('4000');
  const [selectedColor, setSelectedColor] = useState('carbon-light');
  const [selectedProfile, setSelectedProfile] = useState('half-taper');
  const [quantity, setQuantity] = useState(200);
  const [expandedAccordion, setExpandedAccordion] = useState('maintenance');

  // Mock product data - replace with real data
  const product = {
    name: 'Natural shou sugi ban plank',
    price: 89,
    description: 'Natural Shou Sugi Ban plank is a durable, eco-friendly wood product, charred using traditional Japanese techniques for enhanced weather resistance and a unique, textured finish.',
    mainImage: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462',
    galleryImages: [
      'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462',
      'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999',
      'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0',
    ],
  };

  const widths = ['95 mm', '120 mm', '145 mm'];
  const lengths = ['3000 mm', '3600 mm', '4000 mm'];
  const colors = [
    { id: 'brown', image: 'https://www.figma.com/api/mcp/asset/f23c6ed9-4370-484f-af3a-f0c7e7f0a462' },
    { id: 'carbon-light', image: 'https://www.figma.com/api/mcp/asset/d294a76c-f2ce-4a3b-95c0-16e29ef7e999', selected: true },
    { id: 'natural', image: 'https://www.figma.com/api/mcp/asset/68d7e67c-b955-4f7d-818c-8c7a39878aa0' },
    { id: 'dark', image: 'https://www.figma.com/api/mcp/asset/96c4c940-c49c-4bd3-8823-483555dc24ba' },
    { id: 'graphite', image: 'https://www.figma.com/api/mcp/asset/b2f01ae8-4b24-4a8e-8e4a-dcc7e204799e' },
    { id: 'latte', image: 'https://www.figma.com/api/mcp/asset/3213bf57-d148-4e08-bc04-31ee1e520d0e' },
    { id: 'silver', image: 'https://www.figma.com/api/mcp/asset/726192c2-b363-4874-95df-da5b529c98d3' },
  ];

  const profiles = ['half-taper', 'rhombus', 'rectangle'];

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[10px] border-b border-[#BBBBBB]">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-[#7C7C7C]">
          Home / Shop / <span className="text-[#161616]">Natural Shou sugi ban plank</span>
        </p>
      </div>

      {/* Product Section */}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[32px] md:py-[54px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] lg:gap-[80px]">
          {/* Left: Gallery + Main Image */}
          <div className="flex gap-[16px]">
            {/* Gallery Thumbnails */}
            <div className="flex flex-col gap-[12px]">
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  className="w-[80px] h-[80px] border border-[#BBBBBB] overflow-hidden hover:border-[#161616] transition-colors"
                >
                  <Image
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-[#BBAB92] min-h-[400px] lg:min-h-[729px] relative overflow-hidden">
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col gap-[24px]">
            {/* Title & Price */}
            <div>
              <h1
                className="font-['DM_Sans'] font-normal text-[28px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-1.28px] mb-[8px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {product.name}
              </h1>
              <p
                className="font-['DM_Sans'] font-normal text-[28px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-1.28px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {product.price} €
              </p>
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] text-[#161616] tracking-[0.14px]">
              {product.description}
            </p>

            {/* Variants */}
            <div className="flex flex-col gap-[24px]">
              {/* Width */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase">
                  overall width (mm)
                </p>
                <div className="flex gap-[8px] flex-wrap">
                  {widths.map((width, idx) => (
                    <button
                      key={width}
                      onClick={() => setSelectedWidth(width.split(' ')[0])}
                      className={`h-[48px] px-[16px] font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedWidth === width.split(' ')[0]
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#BBBBBB] text-[#161616] hover:border-[#161616]'
                      }`}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase">
                  length (mm)
                </p>
                <div className="flex gap-[8px] flex-wrap">
                  {lengths.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength(length.split(' ')[0])}
                      className={`h-[48px] px-[16px] font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedLength === length.split(' ')[0]
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#BBBBBB] text-[#161616] hover:border-[#161616]'
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase">
                  Color: <span className="text-[#161616]">carbon light</span>
                </p>
                <div className="flex gap-[8px] flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`relative w-[32px] h-[32px] rounded-[4px] overflow-hidden ${
                        selectedColor === color.id ? 'ring-2 ring-[#161616] ring-offset-4' : ''
                      }`}
                    >
                      <Image
                        src={color.image}
                        alt={color.id}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase">
                  Profile
                </p>
                <div className="flex gap-[8px]">
                  {profiles.map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setSelectedProfile(profile)}
                      className={`h-[48px] w-[83px] flex items-center justify-center transition-colors ${
                        selectedProfile === profile
                          ? 'bg-[#161616]'
                          : 'border border-[#BBBBBB] hover:border-[#161616]'
                      }`}
                    >
                      <div className="h-[15px] w-[70px] bg-current opacity-20"></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase">
                  Quantity m2
                </p>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="h-[48px] px-[16px] border border-[#BBBBBB] bg-white font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase focus:border-[#161616] outline-none"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#535353] tracking-[0.6px] uppercase text-center">
                Haven't found what you've looking for?{' '}
                <Link href="/contact" className="text-[#161616] underline">
                  Contact us
                </Link>
              </p>
              <button className="h-[48px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity">
                add to cart
              </button>
            </div>
          </div>
        </div>

        {/* Accordion Section */}
        <div className="mt-[80px] max-w-[672px]">
          <div className="flex flex-col gap-[8px]">
            <div className="h-[1px] bg-[#BBBBBB]"></div>

            {/* Product Maintenance */}
            <div className="flex flex-col gap-[4px]">
              <button
                onClick={() => setExpandedAccordion(expandedAccordion === 'maintenance' ? '' : 'maintenance')}
                className="flex items-center justify-between py-[8px]"
              >
                <p className="font-['Outfit'] font-medium text-[12px] leading-[1.1] text-[#161616] tracking-[0.6px] uppercase">
                  Product maintenance
                </p>
                <span className="text-[20px]">{expandedAccordion === 'maintenance' ? '−' : '+'}</span>
              </button>
              {expandedAccordion === 'maintenance' && (
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] text-[#535353] tracking-[0.14px] pb-[8px]">
                  Every situation is unique, so if you have any questions about maintenance, we encourage you to contact us so that we can assess your needs and offer the most appropriate solution.
                </p>
              )}
            </div>

            <div className="h-[1px] bg-[#BBBBBB]"></div>

            {/* Color Disclaimer */}
            <button
              onClick={() => setExpandedAccordion(expandedAccordion === 'disclaimer' ? '' : 'disclaimer')}
              className="flex items-center justify-between py-[8px]"
            >
              <p className="font-['Outfit'] font-medium text-[12px] leading-[1.1] text-[#161616] tracking-[0.6px] uppercase">
                Color disclaimer
              </p>
              <span className="text-[20px]">{expandedAccordion === 'disclaimer' ? '−' : '+'}</span>
            </button>

            <div className="h-[1px] bg-[#BBBBBB]"></div>

            {/* Shipping & Return */}
            <button
              onClick={() => setExpandedAccordion(expandedAccordion === 'shipping' ? '' : 'shipping')}
              className="flex items-center justify-between py-[8px]"
            >
              <p className="font-['Outfit'] font-medium text-[12px] leading-[1.1] text-[#161616] tracking-[0.6px] uppercase">
                Shipping & return
              </p>
              <span className="text-[20px]">{expandedAccordion === 'shipping' ? '−' : '+'}</span>
            </button>

            <div className="h-[1px] bg-[#BBBBBB]"></div>

            {/* Payment */}
            <button
              onClick={() => setExpandedAccordion(expandedAccordion === 'payment' ? '' : 'payment')}
              className="flex items-center justify-between py-[8px]"
            >
              <p className="font-['Outfit'] font-medium text-[12px] leading-[1.1] text-[#161616] tracking-[0.6px] uppercase">
                Payment
              </p>
              <span className="text-[20px]">{expandedAccordion === 'payment' ? '−' : '+'}</span>
            </button>

            <div className="h-[1px] bg-[#BBBBBB]"></div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-[120px]">
          <div className="flex items-center justify-between mb-[32px]">
            <h2
              className="font-['DM_Sans'] font-light text-[48px] md:text-[80px] leading-none text-[#161616] tracking-[-4.4px]"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Related products
            </h2>
            <Link
              href="/products"
              className="font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:underline"
            >
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-[#EAEAEA] rounded-[8px] p-[24px] flex flex-col gap-[16px]">
                <div className="relative w-full h-[311px] bg-white rounded-[8px] overflow-hidden">
                  <Image
                    src={product.mainImage}
                    alt="Related product"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] text-[#161616] tracking-[-1.28px]"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      Spruce wood
                    </p>
                    <p
                      className="font-['DM_Sans'] font-normal text-[32px] leading-[1.1] text-[#161616] tracking-[-1.28px]"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      89 €
                    </p>
                  </div>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] text-[#535353] tracking-[0.14px]">
                    Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
