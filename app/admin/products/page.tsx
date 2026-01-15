import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductsAdminClient from '@/components/admin/ProductsAdminClient';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { AdminBody, AdminCard } from '@/components/admin/ui/AdminUI';

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
    // Hide generated stock-item products (slug contains "--") from the main products admin list.
    // These are managed via the Inventory page instead.
    .not('slug', 'like', '%--%')
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
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminCard>
        <ProductsAdminClient initialProducts={products} />
      </AdminCard>
    </AdminBody>
  );
}
