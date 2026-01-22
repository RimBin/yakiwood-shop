import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/structured-data';
import { fetchProductBySlug, transformDbProduct } from '@/lib/products.supabase';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductOgImage } from '@/lib/og-image';
import { toLocalePath } from '@/i18n/paths';
import { applySeoOverride } from '@/lib/seo/overrides';
import { supabaseAdmin } from '@/lib/supabase-admin';

function parseStockItemSlug(slug: string) {
  const parts = slug.split('--');
  if (parts.length < 4) return null;
  const [baseSlug, profile, color, size] = parts;
  if (!baseSlug || !profile || !color || !size) return null;
  return { baseSlug, profile, color, size };
}

function parseSizeToken(size: string | undefined | null): { widthMm: number; lengthMm: number } | null {
  if (!size) return null;
  const match = String(size).trim().match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return null;
  const widthMm = Number(match[1]);
  const lengthMm = Number(match[2]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm) || widthMm <= 0 || lengthMm <= 0) return null;
  return { widthMm, lengthMm };
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface ProductPageProps {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildQueryString(searchParams: ProductPageProps['searchParams']): string {
  if (!searchParams) return '';
  const qs = new URLSearchParams();
  for (const [key, raw] of Object.entries(searchParams)) {
    if (typeof raw === 'string') {
      if (raw !== '') qs.set(key, raw);
      continue;
    }
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (typeof v === 'string' && v !== '') qs.append(key, v);
      }
    }
  }
  return qs.toString();
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
export default async function ProductPage({ params, searchParams }: ProductPageProps) {
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

  // If the product has a locale-specific slug, enforce the canonical URL.
  // This prevents mixed-language pages like EN UI under a LT slug (and vice versa).
  const canonicalSlug = currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug;
  if (!resolvedParams.slug.includes('--') && canonicalSlug && resolvedParams.slug !== canonicalSlug) {
    const target = toLocalePath(`/products/${canonicalSlug}`, currentLocale);
    const qs = buildQueryString(searchParams);
    redirect(qs ? `${target}?${qs}` : target);
  }

  // Normalize legacy stock-item URLs into the base product URL with query params.
  if (resolvedParams.slug.includes('--')) {
    const parsed = parseStockItemSlug(resolvedParams.slug);
    if (parsed?.baseSlug) {
      const base = await fetchProductBySlug(parsed.baseSlug, { locale: currentLocale });
      if (base) {
        const size = parseSizeToken(parsed.size);
        const qs = new URLSearchParams();
        if (size) {
          qs.set('w', String(size.widthMm));
          qs.set('l', String(size.lengthMm));
        }

        const colorToken = normalizeKey(parsed.color);
        const profileToken = normalizeKey(parsed.profile);

        if (colorToken) qs.set('ct', colorToken);
        if (profileToken) qs.set('ft', profileToken);

        const colorMatch = (base.colors ?? []).find((c) => normalizeKey(c.name || '').includes(colorToken));
        if (colorMatch?.id) qs.set('c', colorMatch.id);

        const profileMatch = (base.profiles ?? []).find((p) => {
          const hay = normalizeKey([p.code, p.name].filter(Boolean).join(' '));
          return hay.includes(profileToken);
        });
        if (profileMatch?.id) qs.set('f', profileMatch.id);

        const baseSlugForLocale = currentLocale === 'en' ? (base.slugEn ?? base.slug) : base.slug;
        const target = toLocalePath(`/products/${baseSlugForLocale}`, currentLocale);
        redirect(qs.toString() ? `${target}?${qs.toString()}` : target);
      }
    }
  }
  const slugForLocale = canonicalSlug;

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

