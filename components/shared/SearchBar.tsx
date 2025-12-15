'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Ieškoti...',
  className = '',
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full md:max-w-md ${className}`}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3
          bg-white border rounded-lg
          font-['DM_Sans'] text-[#161616]
          transition-all duration-200
          ${isFocused ? 'border-[#161616] shadow-sm' : 'border-[#E1E1E1]'}
        `}
      >
        {/* Search Icon */}
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
            isFocused ? 'text-[#161616]' : 'text-[#BBBBBB]'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className="
            flex-1 bg-transparent outline-none
            text-[15px] font-normal
            placeholder:text-[#BBBBBB]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Paieška"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <svg
            className="w-5 h-5 text-[#161616] animate-spin flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="
              p-1 rounded-full
              text-[#BBBBBB] hover:text-[#161616]
              hover:bg-[#E1E1E1]
              transition-all duration-200
              flex-shrink-0
            "
            aria-label="Išvalyti paiešką"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!isFocused && !query && (
          <kbd
            className="
              hidden sm:inline-flex items-center gap-1
              px-2 py-1 rounded
              bg-[#F5F5F5] border border-[#E1E1E1]
              text-[11px] text-[#535353] font-medium
              flex-shrink-0
            "
          >
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )}
      </div>
    </form>
  );
}
