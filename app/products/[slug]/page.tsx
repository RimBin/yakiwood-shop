import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/structured-data';
import { fetchProductBySlug } from '@/lib/products.supabase';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductOgImage } from '@/lib/og-image';
import { toLocalePath } from '@/i18n/paths';
import { getCanonicalProductPath } from '@/components/configurator/seo';

interface ProductPageProps {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const ogImage = product.images?.[0] || product.image;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const productPath = toLocalePath(`/products/${product.slug}`, currentLocale);

  const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

  return {
    title: displayName,
    description: displayDescription,
    alternates: {
      canonical: getCanonicalProductPath(product.slug),
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
      url: `https://yakiwood.lt${productPath}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: displayName,
      description: displayDescription,
      images: [getProductOgImage(ogImage)],
    },
  };
}

// Main product page component (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const hasSale =
    typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price;
  const offerPrice = hasSale ? product.salePrice! : product.price;

  // Generate structured data for SEO
  const productSchema = generateProductSchema({
    name: displayName,
    slug: product.slug,
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
      url: toLocalePath(`/products/${product.slug}`, currentLocale),
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

