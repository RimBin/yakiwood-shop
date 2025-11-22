import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Metadata } from 'next';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Produktas – ${params.slug}`,
  };
}

export default async function ProduktasPage({ params }: Props) {
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('slug', params.slug).single();
  if (!product) return notFound();

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-sm max-w-2xl mb-6">{product.description}</p>
      <Suspense fallback={<p>Kraunama...</p>}>
        <Konfiguratorius3D productId={product.id} />
      </Suspense>
    </main>
  );
}
