'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import type { Product, Color, Finish } from '@/lib/products';
import { calculateProductPrice, getProductColors, getProductFinishes } from '@/lib/products';
import { Breadcrumbs } from '@/components/ui';
import ImageGallery from './ImageGallery';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableFinishes, setAvailableFinishes] = useState<Finish[]>([]);
  const [loading3D, setLoading3D] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [activeThumb, setActiveThumb] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('maintenance');

  const addItem = useCartStore(state => state.addItem);

  // Load colors and finishes
  useEffect(() => {
    async function loadOptions() {
      const [colors, finishes] = await Promise.all([
        getProductColors(product.id),
        getProductFinishes(product.id),
      ]);
      
      setAvailableColors(colors);
      setAvailableFinishes(finishes);
      
      // Pre-select first options
      if (colors.length > 0) setSelectedColor(colors[0]);
      if (finishes.length > 0) setSelectedFinish(finishes[0]);
    }
    loadOptions();
  }, [product.id]);

  // Calculate final price
  const finalPrice = calculateProductPrice(
    product.basePrice,
    selectedColor?.priceModifier || 0,
    selectedFinish?.priceModifier || 0,
    quantity
  );

  const pricePerUnit = calculateProductPrice(
    product.basePrice,
    selectedColor?.priceModifier || 0,
    selectedFinish?.priceModifier || 0,
    1
  );

  // Handle add to cart
  const handleAddToCart = async () => {
    // Clear previous validation errors
    setValidationError('');

    // Validation
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError('Prašome pasirinkti spalvą');
      return;
    }
    if (availableFinishes.length > 0 && !selectedFinish) {
      setValidationError('Prašome pasirinkti apdailą');
      return;
    }

    setIsAdding(true);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: pricePerUnit,
        quantity,
        color: selectedColor?.name,
        finish: selectedFinish?.name,
        image: product.image,
      };

      addItem(cartItem);

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Optional: Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', {
          currency: 'EUR',
          value: finalPrice,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: pricePerUnit,
            quantity: quantity,
          }],
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setValidationError('Klaida pridedant į krepšelį. Bandykite dar kartą.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = (platform: 'facebook' | 'linkedin' | 'email') => {
    const url = `https://yakiwood.lt/produktai/${product.slug}`;
    const title = product.name;
    const description = product.shortDescription || product.description;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`;
        break;
    }
  };

  return (
    <div className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-[#161616] text-white px-6 py-4 rounded-[24px] shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-['Outfit']">Pridėta į krepšelį</span>
          </div>
        </div>
      )}

      {/* Breadcrumbs - New Figma Style */}
      <div className="max-w-[1440px] mx-auto px-[40px] py-[10px] border-b border-[#BBBBBB]">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-[#7C7C7C]">
          <Link href="/">Home</Link>
          {' / '}
          <Link href="/produktai">Shop</Link>
          {' / '}
          <span className="text-[#161616]">{product.name}</span>
        </p>
      </div>

      {/* Main Product Section - New Figma Layout */}
      <div className="max-w-[1440px] mx-auto px-[40px] py-[54px]">
        <div className="grid grid-cols-1 lg:grid-cols-[80px_790px_1fr] gap-[16px]">
          {/* Thumbnail Gallery - Left (hidden on mobile) */}
          <div className="hidden lg:flex flex-col gap-[12px]">
            {(product.images || [{ id: '1', url: product.image, alt: product.name, isPrimary: true, order: 0 }])
              .slice(0, 3)
              .map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveThumb(idx)}
                  className={`relative w-[80px] h-[80px] rounded-[4px] overflow-hidden ${
                    activeThumb === idx ? 'ring-2 ring-[#161616]' : ''
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
          </div>

          {/* Main Image - Center */}
          <div className="relative bg-[#BBAB92] h-[400px] lg:h-[729px] rounded-[8px] overflow-hidden">
            {show3D && availableColors.length > 0 ? (
              <Konfiguratorius3D
                productId={product.id}
                availableColors={availableColors}
                availableFinishes={availableFinishes}
                onColorChange={setSelectedColor}
                onFinishChange={setSelectedFinish}
                isLoading={loading3D}
              />
            ) : (
              <ImageGallery
                images={
                  product.images || [{ id: '1', url: product.image, alt: product.name, isPrimary: true, order: 0 }]
                }
                productName={product.name}
              />
            )}
          </div>

          {/* Product Info - Right */}
          <div className="flex flex-col gap-[24px]">
            {/* Title & Price */}
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-['DM_Sans'] text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {product.name}
              </h1>
              <p className="font-['DM_Sans'] text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {pricePerUnit.toFixed(0)} €
              </p>
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] max-w-[434px]">
              {product.shortDescription || product.description}
            </p>

            {/* Color Selector - New Figma Style */}
            {!show3D && availableColors.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
                  <span className="text-[#7C7C7C]">Color:</span>
                  <span className="text-[#161616]">{selectedColor?.name || 'Select color'}</span>
                </div>
                <div className="flex gap-[8px] flex-wrap max-h-[43px] overflow-hidden">
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-[32px] h-[32px] rounded-[4px] overflow-hidden ${
                        selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                      }`}
                      title={color.name}
                    >
                      {color.image ? (
                        <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ backgroundColor: color.hex }} className="w-full h-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Finish Selector (if not in 3D mode) */}
            {!show3D && availableFinishes.length > 0 && (
              <div className="space-y-3">
                <label className="font-['DM_Sans'] text-sm font-medium text-[#161616] block">
                  Apdaila
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {availableFinishes.map((finish) => (
                    <label
                      key={finish.id}
                      className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFinish?.id === finish.id
                          ? 'border-[#161616] bg-[#F9F9F9]'
                          : 'border-[#EAEAEA] hover:border-[#BBBBBB]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="finish"
                        value={finish.id}
                        checked={selectedFinish?.id === finish.id}
                        onChange={() => setSelectedFinish(finish)}
                        className="mt-0.5 w-4 h-4 text-[#161616] focus:ring-[#161616]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-['DM_Sans'] font-medium text-[#161616]">
                            {finish.name}
                          </span>
                          {finish.priceModifier !== 0 && (
                            <span className="font-['Outfit'] text-sm text-[#535353]">
                              {finish.priceModifier > 0 ? '+' : ''}€{finish.priceModifier.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {finish.description && (
                          <p className="mt-1 font-['Outfit'] text-xs text-[#7C7C7C]">
                            {finish.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - New Figma Style */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
                Quantity m2
              </p>
              <div className="border border-[#BBBBBB] h-[48px] px-[16px] py-[8px] flex items-center">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Add to Cart Button - New Figma Style */}
            <div className="flex flex-col gap-[8px]">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-['Outfit'] text-red-600">
                  {validationError}
                </div>
              )}
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] text-center text-[#535353]">
                Haven't found what you've looking for?{' '}
                <Link href="/kontaktai" className="text-[#161616] underline">
                  Contact us
                </Link>
              </p>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Pridedama...' : 'add to cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Accordion Section - New Figma Style */}
        <div className="mt-[75px] max-w-[672px] mx-auto">
          <div className="flex flex-col gap-[8px]">
            {[
              {
                id: 'maintenance',
                title: 'PRODUCT MAINTENANCE',
                content:
                  'Every situation is unique, so if you have any questions about maintenance, we encourage you to contact us so that we can assess your needs and offer the most appropriate solution.',
              },
              {
                id: 'disclaimer',
                title: 'COLOR DISCLAIMER',
                content:
                  'Colors may vary slightly from the images shown due to monitor settings and natural wood variations.',
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
            ].map((item, index) => (
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

        {/* Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        <RelatedProducts productId={product.id} currentSlug={product.slug} />
      </div>

      {/* Sticky Add to Cart (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#BBBBBB] p-4 lg:hidden z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-['DM_Sans'] font-medium text-lg text-[#161616]">
              €{pricePerUnit.toFixed(2)}
            </p>
            <p className="font-['Outfit'] text-xs text-[#7C7C7C]">
              {quantity > 1 && `${quantity} vnt. • `}Viso: €{finalPrice.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-6 py-3 bg-[#161616] text-white rounded-full font-['Outfit'] text-sm hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isAdding ? 'Pridedama...' : 'Į krepšelį'}
          </button>
        </div>
      </div>
    </div>
  );
}
