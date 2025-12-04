'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageSection } from './shared/PageLayout';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ fullName: '', email: '', phone: '' });
    setConsent(false);
  };

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Title */}
      <div className="w-full border-b border-[#BBBBBB]">
        <div className="max-w-[1360px] mx-auto px-[40px] pt-[32px] pb-[48px]">
          <h1
            className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] text-[#161616] tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Contact us
          </h1>
        </div>
      </div>

      {/* Subtitle + Form */}
      <div className="w-full flex flex-col items-center pt-[100px] pb-[120px] px-[40px]">
        <p
          className="font-['DM_Sans'] font-light text-[52px] leading-none text-[#161616] text-center tracking-[-2.08px] mb-[68px] max-w-[838px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Need assistance? Leave your contact details, and our manager will reach out for a consultation.
        </p>

        <div className="w-full max-w-[600px]">
          {submitted ? (
            <div className="text-center py-[40px]">
              <p 
                className="font-['DM_Sans'] font-normal text-[32px] text-[#161616] tracking-[-1.28px] mb-[16px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Thank you!
              </p>
              <p className="font-['Outfit'] font-light text-[16px] text-[#7C7C7C] tracking-[0.16px]">
                We&apos;ll get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              {/* Full Name */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  FULL NAME <span className="text-[#F63333]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  EMAIL ADDRESS <span className="text-[#F63333]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Outfit'] font-normal text-[#7C7C7C] text-[12px] tracking-[0.6px] uppercase leading-[1.3]">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-[48px] border border-[#BBBBBB] bg-transparent font-['Outfit'] font-normal text-[14px] text-[#161616] tracking-[0.14px] outline-none px-[16px] focus:border-[#161616] transition-colors"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-[4px]">
                <button
                  type="button"
                  onClick={() => setConsent(!consent)}
                  className={`w-[24px] h-[24px] border border-[#161616] flex items-center justify-center shrink-0 transition-colors ${
                    consent ? 'bg-[#161616]' : 'bg-transparent'
                  }`}
                  aria-label="Consent checkbox"
                >
                  {consent && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <p className="flex-1 font-['Outfit'] font-light text-[12px] text-[#535353] leading-[1.3] tracking-[0.14px]">
                  I agree that my data will be processed directly by Yakiwood or shared with a sales adent located in my area in accordfance with Yakiwood{' '}
                  <Link href="/privacy-policy" className="text-[#161616] font-normal underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !consent}
                className="w-full h-[48px] bg-[#161616] rounded-[100px] flex items-center justify-center font-['Outfit'] font-normal text-white text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 px-[40px] py-[10px]"
              >
                {isSubmitting ? 'SENDING...' : 'LEAVE A REQUEST'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
