import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Breadcrumbs
        items={[
          { label: tAdmin('breadcrumb.home'), href: toLocalePath('/', locale) },
          { label: tAdmin('breadcrumb.admin'), href: toLocalePath('/admin', locale) },
          { label: tAdmin('breadcrumb.products'), href: toLocalePath('/admin/products', locale) },
          { label: tAdmin('breadcrumb.edit') },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] tracking-[-0.96px]">
            {tProducts('editProduct')}
          </h1>
          <p className="mt-2 text-[#535353] font-['DM_Sans']">
            {tProducts('editProductDesc')}
          </p>
        </div>

        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
