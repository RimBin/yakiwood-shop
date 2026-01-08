'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/shared';
import { usePathname } from 'next/navigation';

function UnderMaintenanceScreen({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'yakiwood2025') {
      onAuthenticate();
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#161616] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto w-full">
        {/* Logo/Title */}
        <h1 className="text-5xl md:text-7xl font-['DM_Sans'] font-bold text-white mb-6">
          YAKIWOOD
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-[#E1E1E1] mb-4 font-['Outfit']">
          Shou Sugi Ban Technique
        </p>
        
        {/* Under Construction */}
        <div className="mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4">
            <p className="text-lg md:text-xl text-white font-['DM_Sans'] tracking-wide">
              🚧 UNDER CONSTRUCTION 🚧
            </p>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-base md:text-lg text-[#BBBBBB] mb-8 font-['Outfit'] leading-relaxed">
          We are creating a new website showcasing the unique Japanese wood burning technique.
          <br />
          Coming soon with modern design and comprehensive information!
        </p>

        {/* Login Form */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password to preview"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-[#BBBBBB] focus:outline-none focus:border-white/40 transition-all font-['DM_Sans']"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm font-['Outfit']">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-8 py-3 bg-white text-[#161616] rounded-full font-['DM_Sans'] font-medium hover:bg-[#E1E1E1] transition-all"
            >
              Access Preview
            </button>
          </form>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-4 text-[#E1E1E1] font-['DM_Sans']">
          <p className="text-sm">
            For inquiries:{' '}
            <a href="mailto:info@yakiwood.co.uk" className="text-white hover:underline transition-all">
              info@yakiwood.co.uk
            </a>
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-12 w-full max-w-md mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#BBBBBB] to-white w-2/3 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-[#BBBBBB] mt-2 font-['Outfit']">Coming Soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Skip auth check in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // In development, auto-authenticate
    if (isDevelopment) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }
    
    // Check if user is already authenticated
    const auth = localStorage.getItem('yakiwood_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [isDevelopment]);

  const handleAuthenticate = () => {
    localStorage.setItem('yakiwood_auth', 'true');
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <UnderMaintenanceScreen onAuthenticate={handleAuthenticate} />;
  }

  // Header is fixed; add a top offset so it doesn't overlap page content.
  // Keep auth/admin/studio screens unchanged to avoid breaking centered layouts.
  const normalizedPathname = (pathname || '/').replace(/^\/(lt|en)(?=\/|$)/, '');
  const noHeaderOffsetPrefixes = ['/login', '/register', '/forgot-password', '/reset-password', '/admin', '/studio'];
  const shouldApplyHeaderOffset = !noHeaderOffsetPrefixes.some(
    (prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`)
  );

  return (
    <>
      <Header />
      <div className={shouldApplyHeaderOffset ? 'pt-[120px]' : ''}>
        {children}
      </div>
      <Footer />
    </>
  );
}
