/**
 * Pagination utility functions
 */

export interface PaginationRange {
  pages: (number | 'ellipsis')[];
  hasLeftEllipsis: boolean;
  hasRightEllipsis: boolean;
}

export interface PaginationInfo {
  from: number;
  to: number;
  total: number;
  text: string;
}

/**
 * Calculate which page numbers to show with smart ellipsis
 * @param currentPage - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param maxButtons - Maximum number of page buttons to show (default: 5)
 * @returns Array of page numbers and ellipsis markers
 * 
 * @example
 * getPaginationRange(5, 20, 5) 
 * // Returns: [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxButtons: number = 5
): PaginationRange {
  // If total pages fit in maxButtons, show all
  if (totalPages <= maxButtons) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      hasLeftEllipsis: false,
      hasRightEllipsis: false,
    };
  }

  const pages: (number | 'ellipsis')[] = [];
  const sideButtons = Math.floor((maxButtons - 3) / 2); // Reserve 3 for first, current, last
  
  // Always show first page
  pages.push(1);

  // Calculate range around current page
  let rangeStart = Math.max(2, currentPage - sideButtons);
  let rangeEnd = Math.min(totalPages - 1, currentPage + sideButtons);

  // Adjust range if we're near the edges
  if (currentPage <= sideButtons + 2) {
    rangeEnd = Math.min(totalPages - 1, maxButtons - 1);
  } else if (currentPage >= totalPages - sideButtons - 1) {
    rangeStart = Math.max(2, totalPages - maxButtons + 2);
  }

  // Left ellipsis
  const hasLeftEllipsis = rangeStart > 2;
  if (hasLeftEllipsis) {
    pages.push('ellipsis');
  }

  // Middle pages
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis
  const hasRightEllipsis = rangeEnd < totalPages - 1;
  if (hasRightEllipsis) {
    pages.push('ellipsis');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return { pages, hasLeftEllipsis, hasRightEllipsis };
}

/**
 * Paginate an array of items
 * @param array - Array to paginate
 * @param page - Current page (1-indexed)
 * @param perPage - Items per page
 * @returns Slice of array for current page
 * 
 * @example
 * paginateArray([1,2,3,4,5], 2, 2) // Returns: [3, 4]
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  perPage: number
): T[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return array.slice(start, end);
}

/**
 * Get pagination information text
 * @param total - Total number of items
 * @param page - Current page (1-indexed)
 * @param perPage - Items per page
 * @returns Object with from/to indices and formatted text
 * 
 * @example
 * getPaginationInfo(127, 2, 12)
 * // Returns: { from: 13, to: 24, total: 127, text: "Showing 13-24 of 127 results" }
 */
export function getPaginationInfo(
  total: number,
  page: number,
  perPage: number
): PaginationInfo {
  if (total === 0) {
    return {
      from: 0,
      to: 0,
      total: 0,
      text: 'Showing 0 results',
    };
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return {
    from,
    to,
    total,
    text: `Showing ${from}-${to} of ${total} results`,
  };
}

/**
 * Calculate total pages from total items and items per page
 * @param totalItems - Total number of items
 * @param itemsPerPage - Items per page
 * @returns Total number of pages
 */
export function getTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Clamp page number within valid range
 * @param page - Page number to clamp
 * @param totalPages - Total number of pages
 * @returns Clamped page number (1 to totalPages)
 */
export function clampPage(page: number, totalPages: number): number {
  return Math.max(1, Math.min(page, totalPages));
}
