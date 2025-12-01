import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page Layout Component
 * Provides consistent 1440px max-width centering for all pages
 * Use this wrapper for all page content to maintain design system consistency
 */
export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="w-full max-w-[1440px] px-[16px] md:px-[40px]">
        {children}
      </div>
    </div>
  );
}

/**
 * Page Cover Section
 * Standard cover/hero section with border-bottom
 * Used for page titles (H1)
 */
interface PageCoverProps {
  children: React.ReactNode;
  className?: string;
}

export function PageCover({ children, className = '' }: PageCoverProps) {
  return (
    <div className={`w-full border-b border-[#BBBBBB] pt-[32px] pb-[32px] bg-[#E1E1E1] flex justify-center ${className}`}>
      <div className="w-full max-w-[1440px] px-[16px] md:px-[40px]">
        {children}
      </div>
    </div>
  );
}

/**
 * Page Section
 * Standard content section with consistent padding
 */
interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageSection({ children, className = '', centered = false }: PageSectionProps) {
  return (
    <div className={`w-full px-[16px] md:px-[40px] pt-[80px] md:pt-[120px] pb-[120px] ${centered ? 'flex flex-col items-center' : ''} ${className}`}>
      {children}
    </div>
  );
}
