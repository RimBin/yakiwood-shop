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

      <Breadcrumbs
        items={[
          { label: 'Pagrindinis', href: '/' },
          { label: 'Produktai', href: '/produktai' },
          { label: product.name },
        ]}
      />

      {/* Main Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Images & 3D */}
          <div className="space-y-4">
            {/* View Toggle */}
            {availableColors.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShow3D(false)}
                  className={`flex-1 py-3 px-6 rounded-full font-['Outfit'] text-sm transition-colors ${
                    !show3D
                      ? 'bg-[#161616] text-white'
                      : 'bg-white text-[#161616] border border-[#BBBBBB] hover:border-[#161616]'
                  }`}
                >
                  Nuotraukos
                </button>
                <button
                  onClick={() => {
                    setShow3D(true);
                    setLoading3D(true);
                    setTimeout(() => setLoading3D(false), 1000);
                  }}
                  className={`flex-1 py-3 px-6 rounded-full font-['Outfit'] text-sm transition-colors ${
                    show3D
                      ? 'bg-[#161616] text-white'
                      : 'bg-white text-[#161616] border border-[#BBBBBB] hover:border-[#161616]'
                  }`}
                >
                  3D peržiūra
                </button>
              </div>
            )}

            {/* Content */}
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
                images={product.images || [{ 
                  id: '1', 
                  url: product.image, 
                  alt: product.name, 
                  isPrimary: true, 
                  order: 0 
                }]} 
                productName={product.name} 
              />
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="font-['DM_Sans'] text-3xl md:text-4xl font-medium tracking-[-1px] text-[#161616] mb-3">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="font-['Outfit'] text-[#535353] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="py-4 border-y border-[#BBBBBB]">
              <div className="flex items-baseline gap-3">
                <span className="font-['DM_Sans'] text-4xl font-medium text-[#161616]">
                  €{pricePerUnit.toFixed(2)}
                </span>
                {(selectedColor?.priceModifier || selectedFinish?.priceModifier) && (
                  <span className="font-['Outfit'] text-sm text-[#7C7C7C] line-through">
                    €{product.basePrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="font-['Outfit'] text-xs text-[#7C7C7C] mt-1">
                Kaina be PVM | PVM pridedamas atsiskaitant
              </p>
            </div>

            {/* Color Selector (if not in 3D mode) */}
            {!show3D && availableColors.length > 0 && (
              <div className="space-y-3">
                <label className="font-['DM_Sans'] text-sm font-medium text-[#161616] block">
                  Spalva
                  {selectedColor && (
                    <span className="ml-2 font-['Outfit'] font-normal text-[#7C7C7C]">
                      ({selectedColor.name})
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`relative group ${
                        selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                      }`}
                      title={color.name}
                    >
                      {color.image ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors">
                          <img 
                            src={color.image} 
                            alt={color.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          style={{ backgroundColor: color.hex }}
                          className="w-14 h-14 rounded-lg border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors"
                        />
                      )}
                      {color.priceModifier !== 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#161616] text-white text-[10px] px-1.5 py-0.5 rounded-full font-['Outfit']">
                          {color.priceModifier > 0 ? '+' : ''}€{color.priceModifier.toFixed(0)}
                        </span>
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

            {/* Quantity */}
            <div className="space-y-3">
              <label className="font-['DM_Sans'] text-sm font-medium text-[#161616] block">
                Kiekis
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#BBBBBB] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#F9F9F9] transition-colors"
                    aria-label="Sumažinti kiekį"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-12 text-center font-['DM_Sans'] text-[#161616] border-x border-[#BBBBBB] focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#F9F9F9] transition-colors"
                    aria-label="Padidinti kiekį"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {quantity > 1 && (
                  <span className="font-['Outfit'] text-sm text-[#7C7C7C]">
                    Viso: €{finalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-2">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-['Outfit'] text-red-600">
                  {validationError}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 bg-[#161616] text-white rounded-full font-['DM_Sans'] font-medium text-base hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Pridedama...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Pridėti į krepšelį</span>
                  </>
                )}
              </button>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#BBBBBB]">
              <span className="font-['Outfit'] text-sm text-[#7C7C7C]">Dalintis:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[#BBBBBB] hover:border-[#161616] hover:bg-[#F9F9F9] transition-colors"
                aria-label="Dalintis Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[#BBBBBB] hover:border-[#161616] hover:bg-[#F9F9F9] transition-colors"
                aria-label="Dalintis LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[#BBBBBB] hover:border-[#161616] hover:bg-[#F9F9F9] transition-colors"
                aria-label="Dalintis el. paštu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="pt-6 border-t border-[#BBBBBB]">
                <ul className="space-y-3">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg 
                        className="w-5 h-5 text-[#161616] mt-0.5 flex-shrink-0" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      <span className="font-['Outfit'] text-sm text-[#535353]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
