'use client';

import React from 'react';

interface AccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

export default function Accordion({ isOpen, onToggle, title, children }: AccordionProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 hover:opacity-70 transition-opacity"
        aria-expanded={isOpen}
      >
        {title}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          {isOpen ? (
            <path d="M5 12L10 7L15 12" stroke="#161616" strokeWidth="1.5" strokeLinecap="round"/>
          ) : (
            <>
              <path d="M10 5V15" stroke="#161616" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 10H15" stroke="#161616" strokeWidth="1.5" strokeLinecap="round"/>
            </>
          )}
        </svg>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
