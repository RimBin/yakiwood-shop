/**
 * Dynamic Imports for Code Splitting
 * 
 * This file centralizes all dynamic imports to improve bundle size
 * and loading performance. Heavy components are loaded on-demand.
 */

import dynamic from 'next/dynamic';

/**
 * 3D Configurator
 * Heavy Three.js component - load only when needed
 * Disabled SSR as Three.js requires browser APIs
 */
export const DynamicKonfiguratorius3D = dynamic(
  () => import('@/components/Konfiguratorius3D'),
  {
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading 3D viewer...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for Three.js
  }
);

/**
 * Product Filter Sidebar
 * Complex filtering UI - load dynamically
 */
export const DynamicFilterSidebar = dynamic(
  () => import('@/components/products/FilterSidebar'),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-50 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);

/**
 * Account Orders List
 * Admin/account component - load on demand
 */
export const DynamicOrdersList = dynamic(
  () => import('@/components/account/OrdersList'),
  {
    loading: () => <OrdersListSkeleton />,
  }
);

/**
 * Admin Product Management
 * Heavy admin component - only for admin users
 */
export const DynamicProductManagement = dynamic(
  () => import('@/components/admin/ProductManagement'),
  {
    loading: () => (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    ),
  }
);

/**
 * Admin Analytics Dashboard
 * Charts and heavy visualization libraries
 */
export const DynamicAnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    ),
  }
);

/**
 * Newsletter Signup Modal
 * Modal component - load when triggered
 */
export const DynamicNewsletterModal = dynamic(
  () => import('@/components/modals/NewsletterModal'),
  {
    ssr: false,
  }
);

/**
 * Cart Drawer
 * Shopping cart UI - load on first open
 */
export const DynamicCartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer'),
  {
    loading: () => (
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl p-6">
        <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Image Gallery/Lightbox
 * Product image viewer - load when clicked
 */
export const DynamicImageGallery = dynamic(
  () => import('@/components/products/ImageGallery'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Rich Text Editor (for admin)
 * Heavy editor component
 */
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  {
    loading: () => (
      <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50 animate-pulse" />
    ),
    ssr: false,
  }
);

/**
 * Color Picker Component
 * Design tool - load on demand
 */
export const DynamicColorPicker = dynamic(
  () => import('@/components/ui/ColorPicker'),
  {
    loading: () => (
      <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

// Skeleton Components
function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
          <div className="flex gap-2">
            <div className="h-20 w-20 bg-gray-200 rounded" />
            <div className="h-20 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Prefetch heavy components in the background
 * Call this on user interaction (hover, scroll, etc.)
 */
export function prefetchHeavyComponents() {
  // Prefetch commonly needed components
  DynamicCartDrawer.preload();
  DynamicFilterSidebar.preload();
}
