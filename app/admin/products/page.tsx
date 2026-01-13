import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductsAdminClient from '@/components/admin/ProductsAdminClient';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageLayout } from '@/components/shared/PageLayout';

async function getProducts() {
  const locale = (await getLocale()) as AppLocale;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTo = toLocalePath('/admin/products', locale);
    redirect(`${toLocalePath('/login', locale)}?redirect=${encodeURIComponent(redirectTo)}`);
  }

  // Check if admin (simple check via email - in production use proper RLS)
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect(toLocalePath('/', locale));
  }

  // Fetch products with variants
  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      *,
      variants:product_variants(*)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];

}

export default async function AdminProductsPage() {
  const products = await getProducts();

  const locale = (await getLocale()) as AppLocale;
  return (
    <div className="min-h-screen bg-[#E1E1E1]">
      <PageLayout>
        <div className="py-8">
          <ProductsAdminClient initialProducts={products} />
        </div>
      </PageLayout>
    </div>
  );
}
