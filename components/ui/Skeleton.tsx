/**
 * Skeleton Loading Components
 * 
 * Provides loading states for different page sections
 * to improve perceived performance.
 */

/**
 * Base Skeleton Component
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-live="polite"
      aria-busy="true"
    />
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Image */}
      <Skeleton className="w-full h-64" />
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        {/* Price */}
        <Skeleton className="h-8 w-24" />
        
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product Detail Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
          </div>
        </div>
        
        {/* Details */}
        <div className="space-y-4">
          {/* Title */}
          <Skeleton className="h-10 w-3/4" />
          
          {/* Price */}
          <Skeleton className="h-12 w-32" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          
          {/* Options */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>
          
          {/* Add to cart */}
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Orders List Skeleton
 */
export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          {/* Order header */}
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          
          {/* Order items */}
          <div className="flex gap-2">
            <Skeleton className="h-20 w-20 rounded" />
            <Skeleton className="h-20 w-20 rounded" />
            <Skeleton className="h-20 w-20 rounded" />
          </div>
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t">
            <Skeleton className="h-6 w-32 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Header Skeleton
 */
export function HeaderSkeleton() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          
          <div className="flex gap-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Hero Skeleton
 */
export function HeroSkeleton() {
  return (
    <div className="relative h-[600px] bg-gray-100">
      <Skeleton className="w-full h-full" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-2xl px-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <Skeleton className="h-12 w-40 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Input fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}
      
      {/* Submit button */}
      <Skeleton className="h-12 w-32 rounded-full" />
    </div>
  );
}

/**
 * Text Skeleton
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <TextSkeleton lines={3} />
      <Skeleton className="h-10 w-24 rounded-full" />
    </div>
  );
}

/**
 * Project Card Skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="w-full h-48" />
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <TextSkeleton lines={2} />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="w-full h-64" />
      </div>
      
      {/* Table */}
      <TableSkeleton />
    </div>
  );
}
