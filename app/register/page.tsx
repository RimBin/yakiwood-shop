'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/Checkbox';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to Terms & Conditions');
      return;
    }
    console.log('Register with:', { firstName, lastName, email, phone, password, receiveNews });
  };

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-[16px] py-[80px]">
      <div className="w-full max-w-[640px]">
        {/* Title */}
        <div className="mb-[40px] text-center">
          <h1 className="font-['DM_Sans'] font-light text-[56px] sm:text-[72px] leading-[0.95] tracking-[-2.24px] sm:tracking-[-2.88px] text-[#161616] mb-[16px]">
            Create Account
          </h1>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353]">
            Join us to explore premium burnt wood products
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-[32px] sm:p-[40px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] mb-[20px]">
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
                placeholder="John"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
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
                placeholder="Doe"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+370 600 12345"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-[16px] mb-[32px]">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onChange={setAgreeTerms}
              label={
                <span className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#161616]">
                  I agree to the{' '}
                  <Link href="/terms" className="underline hover:opacity-70">
                    Term & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:opacity-70">
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <Checkbox
              id="receiveNews"
              checked={receiveNews}
              onChange={setReceiveNews}
              label={
                <span className="font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#161616]">
                  I would like to receive news and special offers
                </span>
              }
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors mb-[24px]"
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="relative mb-[24px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#BBBBBB]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-[16px] font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-block w-full h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors flex items-center justify-center"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
