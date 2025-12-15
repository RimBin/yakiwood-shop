import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="h-6 w-96 bg-gray-200 rounded" />
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
      </div>
      
      {/* Product Grid */}
      <ProductGridSkeleton count={6} />
    </div>
  );
}
