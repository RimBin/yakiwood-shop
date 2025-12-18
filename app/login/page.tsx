'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Authentication is not configured');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
    } else {
      router.push('/admin');
    }

    setLoading(false);
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Authentication is not configured');
      setLoading(false);
      return;
    }

    const demoCredentials = {
      admin: { email: 'admin@yakiwood.lt', password: 'demo123456' },
      user: { email: 'user@yakiwood.lt', password: 'demo123456' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[role];
    
    setEmail(demoEmail);
    setPassword(demoPassword);

    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email: demoEmail, 
      password: demoPassword 
    });

    if (authError) {
      setError(authError.message);
    } else {
      router.push(role === 'admin' ? '/admin' : '/account');
    }

    setLoading(false);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center p-[20px]">
      <div className="bg-[#E1E1E1] w-full max-w-[478px] flex flex-col gap-[24px] p-[40px]">
        {/* Top bar with close button */}
        <div className="flex items-start justify-end w-full">
          <button
            type="button"
            onClick={handleClose}
            className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <h1 className="font-['DM_Sans'] font-light text-[48px] leading-none tracking-tight text-[#161616]">
            YAKIWOOD
          </h1>
        </div>

        {/* Don't have account + Create account link */}
        <div className="flex gap-[8px] items-center justify-center">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7C7C7C]">
            Don't have an account yet?
          </p>
          <Link
            href="/register"
            className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:underline"
          >
            Create account
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-[12px] bg-red-50 border border-red-200 rounded">
            <p className="font-['Outfit'] text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] w-full">
          {/* Email field */}
          <div className="flex flex-col gap-[4px] w-full">
            <label htmlFor="email" className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]">
              Email <span className="text-[#F63333]">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[48px] w-full border border-[#BBBBBB] px-[16px] font-['Outfit'] font-normal text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] transition-colors"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-[4px] w-full">
            <label htmlFor="password" className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#7C7C7C]">
              Password <span className="text-[#F63333]">*</span>
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[48px] w-full border border-[#BBBBBB] px-[16px] pr-[48px] font-['Outfit'] font-normal text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Demo logins */}
          <div className="flex flex-col gap-[8px] pt-[8px] border-t border-[#BBBBBB]">
            <p className="font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#7C7C7C] text-center">
              Demo accounts
            </p>
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="flex-1 h-[36px] border border-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors disabled:opacity-60"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="flex-1 h-[36px] border border-[#161616] rounded-[100px] font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors disabled:opacity-60"
              >
                User
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
