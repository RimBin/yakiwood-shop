import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/products';
import { fetchProductBySlug } from '@/lib/products.sanity';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductOgImage } from '@/lib/og-image';

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

  const ogImage = product.images?.[0]?.url || product.image;

  return {
    title: product.name,
    description: product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: [
        {
          url: getProductOgImage(ogImage),
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
      url: `https://yakiwood.lt/products/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription || product.description,
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

  // Generate structured data for SEO
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema(product);

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
