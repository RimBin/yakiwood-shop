'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login with:', { email, password });
  };

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-[16px] py-[80px]">
      <div className="w-full max-w-[480px]">
        {/* Title */}
        <div className="mb-[40px] text-center">
          <h1 className="font-['DM_Sans'] font-light text-[56px] sm:text-[72px] leading-[0.95] tracking-[-2.24px] sm:tracking-[-2.88px] text-[#161616] mb-[16px]">
            Login
          </h1>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353]">
            Welcome back! Please enter your details
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-[32px] sm:p-[40px]">
          <div className="space-y-[20px] mb-[24px]">
            <div>
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
                placeholder="Enter your password"
                className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] placeholder:text-[#BBBBBB]"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-[32px]">
            <Link 
              href="/forgot-password" 
              className="font-['Outfit'] font-normal text-[12px] leading-[1.5] text-[#161616] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors mb-[24px]"
          >
            Login
          </button>

          {/* Divider */}
          <div className="relative mb-[24px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#BBBBBB]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-[16px] font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                Or
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#535353] mb-[16px]">
              Don't have an account?
            </p>
            <Link
              href="/register"
              className="inline-block w-full h-[48px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
