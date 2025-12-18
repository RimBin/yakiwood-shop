'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import RadioButton from '@/components/ui/RadioButton';
import { Checkbox } from '@/components/ui/Checkbox';
import ModalOverlay from '@/components/modals/ModalOverlay';
import LoginModal from '@/components/modals/LoginModal';
import RegisterModal from '@/components/modals/RegisterModal';
import SuccessModal from '@/components/modals/SuccessModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
import { PageCover } from '@/components/shared/PageLayout';

export default function CheckoutPage() {
  const { items } = useCartStore();
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Contact Information
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Delivery Information
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [rememberCard, setRememberCard] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle checkout submission
    console.log('Checkout submitted');
  };

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover Section */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          Checkout
        </h1>
      </PageCover>

      <form onSubmit={handleSubmit} className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-[672px_1fr] gap-[40px]">
          {/* Left Column - Forms */}
          <div className="space-y-[64px]">
            {/* Contact Information */}
            <div>
              <div className="flex items-center justify-between pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                  Contact Information
                </h2>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:opacity-70 transition-opacity"
                >
                  Log in
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                <div>
                  <label htmlFor="firstName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                  Delivery Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
                <div>
                  <label htmlFor="country" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                  />
                </div>
              </div>

              <Checkbox
                id="saveAddress"
                label="Save this address for future orders"
                checked={saveAddress}
                onChange={setSaveAddress}
              />

              <div className="mt-[24px]">
                <label htmlFor="deliveryNotes" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  id="deliveryNotes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={4}
                  className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-[24px]">
                {/* Card Payment */}
                <div>
                  <div className="flex items-center justify-between mb-[16px]">
                    <RadioButton
                      name="payment"
                      value="card"
                      label="Credit/Debit Card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12px] text-[#535353]">Stripe</span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-[16px] pl-[32px]">
                      <div>
                        <label htmlFor="cardNumber" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-[16px]">
                        <div>
                          <label htmlFor="expiryDate" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM/YY"
                            required
                            className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                            required
                            className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                          />
                        </div>
                      </div>
                      <Checkbox
                        id="rememberCard"
                        label="Remember this card for future purchases"
                        checked={rememberCard}
                        onChange={setRememberCard}
                      />
                    </div>
                  )}
                </div>

                {/* Bank Transfer */}
                <div className="pt-[16px] border-t border-[#BBBBBB]">
                  <RadioButton
                    name="payment"
                    value="bank"
                    label="Bank Transfer"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                  />
                </div>

                {/* PayPal */}
                <div className="pt-[16px] border-t border-[#BBBBBB]">
                  <div className="flex items-center justify-between">
                    <RadioButton
                      name="payment"
                      value="paypal"
                      label="PayPal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <span className="text-[12px] text-[#535353]">PayPal</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-[32px] grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                <Link
                  href="/cart"
                  className="h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors flex items-center justify-center"
                >
                  Return to Cart
                </Link>
                <button
                  type="submit"
                  className="h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="bg-white rounded-[24px] p-[24px] sm:p-[40px]">
              <h2 className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616] mb-[24px]">
                Order Summary
              </h2>

              {/* Products */}
              <div className="space-y-[16px] mb-[24px] pb-[24px] border-b border-[#BBBBBB]">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.finish}`} className="flex gap-[16px]">
                    <div className="w-[80px] h-[90px] rounded-[8px] bg-[#E1E1E1] overflow-hidden shrink-0">
                      {/* Placeholder - replace with actual product image */}
                      <div className="w-full h-full bg-gradient-to-br from-[#BBBBBB] to-[#E1E1E1]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-['DM_Sans'] font-light text-[16px] leading-[1.1] tracking-[-0.64px] text-[#161616] mb-[4px]">
                        {item.name}
                      </h3>
                      <p className="font-['Outfit'] font-light text-[12px] leading-[1.3] text-[#535353] mb-[8px]">
                        Qty: {item.quantity} pcs
                      </p>
                      <div className="font-['DM_Sans'] font-light text-[16px] leading-[1.1] tracking-[-0.64px] text-[#161616]">
                        {item.basePrice * item.quantity} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-[12px] mb-[24px]">
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    Subtotal
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                    Shipping
                  </span>
                  <span className="font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616]">
                    {shipping === 0 ? 'Free' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#BBBBBB] mb-[24px]" />

              {/* Total */}
              <div className="flex items-center justify-between mb-[8px]">
                <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                  Total
                </span>
                <span className="font-['DM_Sans'] font-light text-[24px] leading-[1.1] tracking-[-0.96px] text-[#161616]">
                  {total.toFixed(2)} €
                </span>
              </div>
              <p className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                Including VAT
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <ModalOverlay isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onForgotPassword={() => {
            setShowLoginModal(false);
            setShowForgotPasswordModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)}>
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onSuccess={() => {
            setShowForgotPasswordModal(false);
            setSuccessMessage("We've sent you an email with a link to update your password");
            setShowSuccessModal(true);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />
      </ModalOverlay>
    </main>
  );
}
