'use client';

import { useCartStore, CartItem } from '@/lib/cart/store';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

// Product image placeholder - local asset
const productPlaceholder = "/images/ui/imgCart.jpg";

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Cart Icon
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 7.67V6.7C7.5 4.45 9.31 2.24 11.56 2.03C14.24 1.77 16.5 3.88 16.5 6.51V7.89" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.4955 12H15.5045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.49451 12H8.50349" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface CartItemCardProps {
  item: CartItem;
  onRemove: (lineId: string) => void;
  size?: 'small' | 'large';
}

function CartItemCard({ item, onRemove, size = 'small' }: CartItemCardProps) {
  const isSmall = size === 'small';
  
  return (
    <div className={`flex ${isSmall ? 'gap-[8px]' : 'gap-[14px]'} items-start w-full relative`}>
      {/* Product Image */}
      <div 
        className={`relative shrink-0 rounded-[8px] overflow-hidden bg-[#E1E1E1] ${
          isSmall ? 'w-[72px] h-[98px]' : 'w-[111px] h-[125px]'
        }`}
      >
        <Image
          src={productPlaceholder}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Title and Price */}
        <div className="flex flex-col gap-[4px]">
          <p className={`font-['DM_Sans'] font-medium text-[#161616] ${
            isSmall ? 'text-[14px] tracking-[-0.28px]' : 'text-[16px] tracking-[-0.32px]'
          } leading-[1.2]`} style={{ fontVariationSettings: "'opsz' 14" }}>
            {item.name}
          </p>
          <p className={`font-['DM_Sans'] font-medium text-[#161616] ${
            isSmall ? 'text-[14px] tracking-[-0.28px]' : 'text-[16px] tracking-[-0.32px]'
          } leading-[1.2]`} style={{ fontVariationSettings: "'opsz' 14" }}>
            {item.basePrice} €
          </p>
        </div>
        
        {/* Dimensions & Quantity */}
        <div className={`flex flex-col gap-[4px] ${isSmall ? 'mt-[24px]' : 'mt-[32px]'}`}>
          {(item.color || item.finish) && (
            <p className="font-['Outfit'] font-normal text-[#535353] text-[12px] leading-[1.3]">
              {item.color && `Color: ${item.color}`}
              {item.color && item.finish && ' · '}
              {item.finish && `Finish: ${item.finish}`}
            </p>
          )}
          <p className="font-['Outfit'] font-normal text-[#535353] text-[12px] leading-[1.3]">
            Qty: {item.quantity} pcs
          </p>
        </div>
      </div>
      
      {/* Remove Button */}
      <button 
        onClick={() => onRemove(item.lineId)}
        className="absolute bottom-0 right-0 font-['Outfit'] font-normal text-[#161616] text-[12px] tracking-[0.6px] uppercase py-[8px] hover:underline"
      >
        Remove
      </button>
    </div>
  );
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, total } = useCartStore();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const [couponCode, setCouponCode] = useState('');
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total();
  const shipping = 0;
  const totalAmount = subtotal + shipping;
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[552px] bg-white z-[101] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[24px] border-b border-[#BBBBBB]">
          <p className="font-['DM_Sans'] font-normal text-[#161616] text-[24px] tracking-[-0.96px] leading-[1.1]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Your cart ({itemCount})
          </p>
          <button onClick={onClose} className="p-[4px] hover:opacity-70 transition-opacity">
            <CloseIcon />
          </button>
        </div>
        
        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col gap-[24px] items-center justify-center flex-1 px-[24px]">
            <p className="font-['DM_Sans'] font-medium text-[#161616] text-[18px] tracking-[-0.36px] leading-[1.2]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Your cart is empty
            </p>
            <Link
              href={toLocalePath('/products', currentLocale)}
              onClick={onClose}
              className="border border-[#161616] rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[#161616] text-[12px] tracking-[0.6px] uppercase leading-[1.2] hover:bg-[#535353] hover:text-white transition-colors"
            >
              Return to shop
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <>
            {/* Products List */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">
              <div className="flex flex-col">
                {items.map((item, index) => (
                  <div key={item.lineId}>
                    <CartItemCard 
                      item={item} 
                      onRemove={removeItem} 
                    />
                    {index < items.length - 1 && (
                      <div className="h-[1px] bg-[#BBBBBB] my-[16px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Coupon Code */}
            <div className="px-[24px] pb-[16px]">
              <div className="flex items-center border border-[#BBBBBB] rounded-[100px] h-[56px] pl-[24px] pr-[8px]">
                <input
                  type="text"
                  placeholder="Apply coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] bg-transparent outline-none placeholder:text-[#7C7C7C]"
                />
                <button className="bg-[#161616] text-white rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.2] hover:opacity-90 transition-opacity">
                  Apply
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-[#161616] mx-[24px] mb-[24px] rounded-[16px]">
              <div className="p-[24px] flex flex-col gap-[24px]">
                <p className="font-['DM_Sans'] font-normal text-white text-[24px] tracking-[-0.96px] leading-[1.1]" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Order summary
                </p>
                
                {/* Subtotals */}
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                      Subtotal
                    </p>
                    <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                      {subtotal.toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                      Shipping
                    </p>
                    <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                      {shipping.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-[1px] bg-[#535353]" />
              
              {/* Total & Checkout */}
              <div className="p-[24px] flex flex-col gap-[24px]">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="font-['DM_Sans'] font-medium text-white text-[18px] tracking-[-0.36px] leading-[1.2]" style={{ fontVariationSettings: "'opsz' 14" }}>
                      Total amount
                    </p>
                    <p className="font-['DM_Sans'] font-medium text-white text-[18px] tracking-[-0.36px] leading-[1.2]" style={{ fontVariationSettings: "'opsz' 14" }}>
                      {totalAmount.toFixed(2)} €
                    </p>
                  </div>
                  <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] leading-[1.3]">
                    Including taxes
                  </p>
                </div>
                
                <Link
                  href={toLocalePath('/checkout', currentLocale)}
                  onClick={onClose}
                  className="bg-white text-[#161616] rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.2] text-center hover:opacity-90 transition-opacity"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Cart Button Component for Header
interface CartButtonProps {
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
}

export function CartButton({ onClick, variant = 'desktop' }: CartButtonProps) {
  const { items } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  if (variant === 'mobile') {
    return (
      <button
        onClick={onClick}
        className="border border-[#535353] rounded-[100px] h-[40px] px-[20px] flex items-center gap-[8px] hover:border-[#161616] transition-colors relative"
      >
        <CartIcon />
        {itemCount > 0 && (
          <div className="absolute -top-[2px] left-[34px] bg-[#161616] rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <span className="font-['Outfit'] font-normal text-white text-[10px] tracking-[0.6px] uppercase">
              {itemCount}
            </span>
          </div>
        )}
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="border border-[#535353] rounded-[100px] h-[48px] px-[24px] flex items-center gap-[8px] hover:border-[#161616] transition-colors relative"
    >
      <CartIcon />
      <span className="font-['Outfit'] font-normal text-[#161616] text-[12px] tracking-[0.6px] uppercase">
        Cart
      </span>
      {itemCount > 0 && (
        <div className="absolute top-[6px] left-[38px] bg-[#161616] rounded-full w-[16px] h-[16px] flex items-center justify-center">
          <span className="font-['Outfit'] font-normal text-white text-[10px] tracking-[0.6px] uppercase">
            {itemCount}
          </span>
        </div>
      )}
    </button>
  );
}

// Default export - Cart Page Component
export default function Cart() {
  const { items, removeItem, total, clear } = useCartStore();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const [couponCode, setCouponCode] = useState('');
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total();
  const shipping = 0;
  const totalAmount = subtotal + shipping;
  
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover */}
      <div className="border-b border-[#BBBBBB] px-[16px] md:px-[40px] py-[16px] md:py-[32px]">
        <div className="flex gap-[8px] md:gap-[15px] items-start text-[#161616]">
          <h1 className="font-['DM_Sans'] font-light text-[45px] md:text-[128px] leading-none md:leading-[0.95] tracking-[-1.8px] md:tracking-[-6.4px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Cart
          </h1>
          <span className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.2] md:leading-[1.1] tracking-[-0.36px] md:tracking-[-1.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            ({itemCount})
          </span>
        </div>
      </div>
      
      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col gap-[24px] items-center justify-center py-[120px] px-[16px]">
          <p className="font-['DM_Sans'] font-normal text-[#161616] text-[24px] tracking-[-0.96px] leading-[1.1]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Your cart is empty
          </p>
          <Link
            href={toLocalePath('/products', currentLocale)}
            className="border border-[#161616] rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[#161616] text-[12px] tracking-[0.6px] uppercase leading-[1.2] hover:bg-[#535353] hover:text-white transition-colors"
          >
            Return to shop
          </Link>
        </div>
      ) : (
        /* Cart with Items */
        <div className="px-[16px] md:px-[40px] py-[24px] md:py-[40px]">
          <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[40px]">
            {/* Products List */}
            <div className="flex-1">
              <div className="flex flex-col">
                {items.map((item, index) => (
                  <div key={item.lineId}>
                    <CartItemCard 
                      item={item} 
                      onRemove={removeItem} 
                      size="large" 
                    />
                    {index < items.length - 1 && (
                      <div className="h-[1px] bg-[#BBBBBB] my-[16px]" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Coupon Code */}
              <div className="mt-[24px]">
                <div className="flex items-center border border-[#BBBBBB] rounded-[100px] h-[56px] pl-[24px] pr-[8px] max-w-[400px]">
                  <input
                    type="text"
                    placeholder="Apply coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] bg-transparent outline-none placeholder:text-[#7C7C7C]"
                  />
                  <button className="bg-[#161616] text-white rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.2] hover:opacity-90 transition-opacity">
                    Apply
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-[#161616] rounded-[16px]">
                <div className="p-[24px] flex flex-col gap-[24px]">
                  <p className="font-['DM_Sans'] font-normal text-white text-[24px] tracking-[-0.96px] leading-[1.1]" style={{ fontVariationSettings: "'opsz' 14" }}>
                    Order summary
                  </p>
                  
                  {/* Subtotals */}
                  <div className="flex flex-col gap-[16px]">
                    <div className="flex items-center justify-between">
                      <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                        Subtotal
                      </p>
                      <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                        {subtotal.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                        Shipping
                      </p>
                      <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                        {shipping.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="h-[1px] bg-[#535353]" />
                
                {/* Total & Checkout */}
                <div className="p-[24px] flex flex-col gap-[24px]">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <p className="font-['DM_Sans'] font-medium text-white text-[18px] tracking-[-0.36px] leading-[1.2]" style={{ fontVariationSettings: "'opsz' 14" }}>
                        Total amount
                      </p>
                      <p className="font-['DM_Sans'] font-medium text-white text-[18px] tracking-[-0.36px] leading-[1.2]" style={{ fontVariationSettings: "'opsz' 14" }}>
                        {totalAmount.toFixed(2)} €
                      </p>
                    </div>
                    <p className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] leading-[1.3]">
                      Including taxes
                    </p>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="bg-white text-[#161616] rounded-[100px] px-[40px] py-[14px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase leading-[1.2] text-center hover:opacity-90 transition-opacity w-full"
                  >
                    Checkout
                  </button>
                  
                  <button
                    onClick={clear}
                    className="font-['Outfit'] font-normal text-[#BBBBBB] text-[12px] tracking-[0.6px] uppercase leading-[1.2] text-center hover:text-white transition-colors"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
