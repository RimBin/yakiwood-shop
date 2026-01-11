'use client';

import { getPaginationRange, getPaginationInfo } from '@/lib/pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items (optional, for display) */
  totalItems?: number;
  /** Items per page (optional, for display) */
  itemsPerPage?: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when items per page changes */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Show items-per-page dropdown */
  showPageSize?: boolean;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Maximum number of page buttons to show (default: 5) */
  maxPageButtons?: number;
  /** Additional CSS classes */
  className?: string;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  showPageSize = false,
  showFirstLast = false,
  maxPageButtons = 5,
  className = '',
}: PaginationProps) {
  // Ensure currentPage is within valid range
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Get pagination range with ellipsis
  const { pages } = getPaginationRange(safePage, totalPages, maxPageButtons);

  // Get "Showing X-Y of Z" info
  const paginationInfo = totalItems && itemsPerPage 
    ? getPaginationInfo(totalItems, safePage, itemsPerPage)
    : null;

  // Navigation handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);
  const goToPrevious = () => goToPage(safePage - 1);
  const goToNext = () => goToPage(safePage + 1);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = Number(e.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newPerPage);
    }
  };

  // Don't render if only one page and no page size selector
  if (totalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Left side: Results info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Results info */}
        {paginationInfo && (
          <div className="text-sm text-[#535353] font-['DM_Sans']">
            {paginationInfo.text}
          </div>
        )}

        {/* Items per page dropdown */}
        {showPageSize && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="items-per-page"
              className="text-sm text-[#535353] font-['DM_Sans']"
            >
              Per page:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-3 py-1.5 border border-[#E1E1E1] rounded-lg text-sm font-['DM_Sans'] bg-white focus:outline-none focus:ring-2 focus:ring-[#161616] focus:border-transparent yw-select"
              aria-label="Items per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page button */}
          {showFirstLast && (
            <button
              onClick={goToFirst}
              disabled={safePage === 1}
              aria-label="Go to first page"
              className="p-2 rounded-lg border border-[#E1E1E1] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Previous page button */}
          <button
            onClick={goToPrevious}
            disabled={safePage === 1}
            aria-label="Go to previous page"
            className="p-2 rounded-lg border border-[#E1E1E1] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-[#535353] font-['DM_Sans'] select-none"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === safePage;

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    min-w-[40px] px-3 py-2 rounded-lg font-['DM_Sans'] text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-[#161616] text-white cursor-default'
                        : 'border border-[#E1E1E1] text-[#161616] hover:bg-[#F5F5F5]'
                    }
                    ${isActive ? '' : 'sm:inline-flex'}
                    ${
                      // Hide some page numbers on mobile (keep current, first, last)
                      !isActive && page !== 1 && page !== totalPages
                        ? 'hidden sm:inline-flex'
                        : ''
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            onClick={goToNext}
            disabled={safePage === totalPages}
            aria-label="Go to next page"
            className="p-2 rounded-lg border border-[#E1E1E1] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Last page button */}
          {showFirstLast && (
            <button
              onClick={goToLast}
              disabled={safePage === totalPages}
              aria-label="Go to last page"
              className="p-2 rounded-lg border border-[#E1E1E1] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            >
              <ChevronsRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
