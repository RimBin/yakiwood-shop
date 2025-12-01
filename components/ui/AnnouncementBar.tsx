'use client';

import { useState } from 'react';

interface AnnouncementBarProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  dismissible?: boolean;
  className?: string;
}

export default function AnnouncementBar({
  message,
  linkText,
  linkHref,
  dismissible = true,
  className = '',
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`w-full bg-[#161616] py-3 px-4 relative ${className}`}>
      <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
        <p className="font-['Outfit'] font-normal text-[12px] sm:text-[14px] leading-[1.1] tracking-[0.14px] text-white text-center">
          {message}
          {linkText && linkHref && (
            <a
              href={linkHref}
              className="underline ml-1 hover:opacity-80 transition-opacity"
            >
              {linkText}
            </a>
          )}
        </p>

        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-80 transition-opacity"
            aria-label="Close announcement"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
