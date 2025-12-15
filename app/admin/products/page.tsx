import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductsAdminClient from '@/components/admin/ProductsAdminClient';

async function getProducts() {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin/products');
  }

  // Check if admin (simple check via email - in production use proper RLS)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/');
  }

  // Fetch products with variants
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] tracking-[-0.96px]">
            Produktų valdymas
          </h1>
          <p className="mt-2 text-[#535353] font-['DM_Sans']">
            Valdykite produktus, variantas ir atsargas
          </p>
        </div>

        <ProductsAdminClient initialProducts={products} />
      </div>
    </div>
  );
}
