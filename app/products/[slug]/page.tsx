import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/structured-data';
import { fetchProductBySlug, transformDbProduct } from '@/lib/products.supabase';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductOgImage } from '@/lib/og-image';
import { toLocalePath } from '@/i18n/paths';
import { applySeoOverride } from '@/lib/seo/overrides';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface ProductPageProps {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let product = await fetchProductBySlug(resolvedParams.slug, { locale: 'en' });

  if (!product && resolvedParams.slug.includes('--') && supabaseAdmin) {
    const columnsToTry = ['slug_en', 'slug'] as const;
    for (const column of columnsToTry) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, product_variants(*)')
        .eq(column, resolvedParams.slug)
        .maybeSingle();
      if (!error && data) {
        product = transformDbProduct(data as any);
        break;
      }
    }
  }

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const ogImage = product.images?.[0] || product.image;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const slugForLocale = currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug;
  const productPath = toLocalePath(`/products/${slugForLocale}`, currentLocale);
  const canonical = `https://yakiwood.lt${productPath}`;

  const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

  const metadata: Metadata = {
    title: displayName,
    description: displayDescription,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: displayName,
      description: displayDescription,
      images: [
        {
          url: getProductOgImage(ogImage),
          width: 1200,
          height: 630,
          alt: displayName,
        },
      ],
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: displayName,
      description: displayDescription,
      images: [getProductOgImage(ogImage)],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

// Main product page component (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  let product = await fetchProductBySlug(resolvedParams.slug, { locale: 'en' });

  if (!product && resolvedParams.slug.includes('--') && supabaseAdmin) {
    const columnsToTry = ['slug_en', 'slug'] as const;
    for (const column of columnsToTry) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, product_variants(*)')
        .eq(column, resolvedParams.slug)
        .maybeSingle();
      if (!error && data) {
        product = transformDbProduct(data as any);
        break;
      }
    }
  }

  if (!product) {
    notFound();
  }

  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const slugForLocale = currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug;

  const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const hasSale =
    typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price;
  const offerPrice = hasSale ? product.salePrice! : product.price;

  // Generate structured data for SEO
  const productSchema = generateProductSchema({
    name: displayName,
    slug: slugForLocale,
    description: displayDescription ?? '',
    basePrice: offerPrice,
    image: product.image,
    images: product.images,
    category: product.category,
    woodType: product.woodType,
    inStock: product.inStock,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: currentLocale === 'lt' ? 'Pagrindinis' : 'Home',
      url: toLocalePath('/', currentLocale),
    },
    {
      name: currentLocale === 'lt' ? 'Produktai' : 'Products',
      url: toLocalePath('/products', currentLocale),
    },
    {
      name: displayName,
      url: toLocalePath(`/products/${slugForLocale}`, currentLocale),
    },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Client Component with product data */}
      <ProductDetailClient product={product} />
    </>
  );
}

