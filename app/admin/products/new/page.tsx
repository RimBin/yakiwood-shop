import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import { Breadcrumbs } from '@/components/ui';

async function checkAuth() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin/products/new');
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/');
  }
}

export default async function NewProductPage() {
  await checkAuth();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Breadcrumbs
        items={[
            { label: 'Pradžia', href: '/' },
          { label: 'Administravimas', href: '/admin' },
          { label: 'Produktai', href: '/admin/products' },
          { label: 'Naujas' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] tracking-[-0.96px]">
            Naujas produktas
          </h1>
          <p className="mt-2 text-[#535353] font-['DM_Sans']">
            Sukurkite naują produktą su variantais
          </p>
        </div>

        <ProductForm mode="create" />
      </div>
    </div>
  );
}
