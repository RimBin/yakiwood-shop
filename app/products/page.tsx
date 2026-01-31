import ProductsPageClient from '@/components/products/ProductsPageClient';
import { fetchProducts, type Product } from '@/lib/products.supabase';

export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    try {
      const stockItems = await fetchProducts({ mode: 'stock-items' });
      products = stockItems.length > 0 ? stockItems : await fetchProducts({ mode: 'active' });
    } catch (stockError) {
      console.warn('Stock items unavailable, falling back to active products.', stockError);
      products = await fetchProducts({ mode: 'active' });
    }
  } catch (err) {
    console.error('Error loading products:', err);
    error = err instanceof Error ? err.message : 'Failed to load products';
  }

  return <ProductsPageClient initialProducts={products} initialError={error} />;
}
