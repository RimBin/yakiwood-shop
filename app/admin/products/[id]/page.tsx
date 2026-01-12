import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover, PageLayout } from '@/components/shared/PageLayout';

async function getProduct(id: string) {
  const locale = (await getLocale()) as AppLocale;
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const redirectTo = toLocalePath(`/admin/products/${id}`, locale);
    redirect(`${toLocalePath('/login', locale)}?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect(toLocalePath('/', locale));
  }

  // Fetch product with variants
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return product;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  const locale = (await getLocale()) as AppLocale;
  const tAdmin = await getTranslations({ locale, namespace: 'admin' });
  const tProducts = await getTranslations({ locale, namespace: 'admin.products' });

  return (
    <div className="min-h-screen bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: tAdmin('breadcrumb.home'), href: toLocalePath('/', locale) },
          { label: tAdmin('breadcrumb.admin'), href: toLocalePath('/admin', locale) },
          { label: tAdmin('breadcrumb.products'), href: toLocalePath('/admin/products', locale) },
          { label: tAdmin('breadcrumb.edit') },
        ]}
      />

      <PageCover>
        <div className="flex flex-col gap-[12px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {tProducts('editProduct')}
          </h1>
          <p className="font-['Outfit'] font-light text-[14px] md:text-[16px] leading-[1.5] tracking-[0.14px] text-[#535353]">
            {tProducts('editProductDesc')}
          </p>
        </div>
      </PageCover>

      <PageLayout>
        <div className="py-8">
          <ProductForm mode="edit" product={product} />
        </div>
      </PageLayout>
    </div>
  );
}
