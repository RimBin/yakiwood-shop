import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductsAdminClient from '@/components/admin/ProductsAdminClient';
import { Breadcrumbs } from '@/components/ui';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageLayout } from '@/components/shared/PageLayout';

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
    <div className="min-h-screen bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: tAdmin('breadcrumb.home'), href: toLocalePath('/', locale) },
          { label: tAdmin('breadcrumb.admin'), href: toLocalePath('/admin', locale) },
          { label: tAdmin('breadcrumb.products') },
        ]}
      />

      <PageCover>
        <div className="flex flex-col gap-[12px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {tProducts('title')}
          </h1>
          <p className="font-['Outfit'] font-light text-[14px] md:text-[16px] leading-[1.5] tracking-[0.14px] text-[#535353]">
            {tProducts('subtitle')}
          </p>
        </div>
      </PageCover>

      <PageLayout>
        <div className="py-8">
          <ProductsAdminClient initialProducts={products} />
        </div>
      </PageLayout>
    </div>
  );
}
