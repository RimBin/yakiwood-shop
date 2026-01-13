import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import { getLocale, getTranslations } from 'next-intl/server';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageLayout } from '@/components/shared/PageLayout';

async function checkAuth() {
  const locale = (await getLocale()) as AppLocale;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const redirectTo = toLocalePath('/admin/products/new', locale);
    redirect(`${toLocalePath('/login', locale)}?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect(toLocalePath('/', locale));
  }
}

export default async function NewProductPage() {
  await checkAuth();

  const locale = (await getLocale()) as AppLocale;
  await getTranslations({ locale, namespace: 'admin.products' });

  return (
    <div className="min-h-screen bg-[#E1E1E1]">
      <PageLayout>
        <div className="py-8">
          <ProductForm mode="create" />
        </div>
      </PageLayout>
    </div>
  );
}
