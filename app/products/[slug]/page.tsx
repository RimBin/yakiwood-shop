import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
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

  const ogImage = product.images?.[0] || product.image;

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
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
      description: product.description,
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

  // Transform to ProductInput for SEO schema
  const productInput = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    basePrice: product.price,
    image: product.image,
    images: product.images,
    sku: product.id,
    category: product.category,
    woodType: product.woodType,
    inStock: true,
  };

  // Generate structured data for SEO
  const productSchema = generateProductSchema(productInput);
  
  const breadcrumbItems = [
    { name: 'Pradžia', url: 'https://yakiwood.lt' },
    { name: 'Produktai', url: 'https://yakiwood.lt/produktai' },
    { name: product.name, url: `https://yakiwood.lt/products/${product.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

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
