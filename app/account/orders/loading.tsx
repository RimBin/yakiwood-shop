import { OrdersListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-6 w-64 bg-gray-200 rounded" />
      </div>
      
      <OrdersListSkeleton count={5} />
    </div>
  );
}
