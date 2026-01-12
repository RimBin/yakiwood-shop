import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductsAdminClient from '@/components/admin/ProductsAdminClient';
import { Breadcrumbs } from '@/components/ui';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

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
  const tAdmin = await getTranslations({ locale, namespace: 'admin' });
  const tProducts = await getTranslations({ locale, namespace: 'admin.products' });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Breadcrumbs
        items={[
          { label: tAdmin('breadcrumb.home'), href: toLocalePath('/', locale) },
          { label: tAdmin('breadcrumb.admin'), href: toLocalePath('/admin', locale) },
          { label: tAdmin('breadcrumb.products') },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] tracking-[-0.96px]">
            {tProducts('title')}
          </h1>
          <p className="mt-2 text-[#535353] font-['DM_Sans']">
            {tProducts('subtitle')}
          </p>
        </div>

        <ProductsAdminClient initialProducts={products} />
      </div>
    </div>
  );
}
