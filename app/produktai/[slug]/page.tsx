import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/structured-data';
import { fetchProductBySlug, fetchProducts, transformDbProduct } from '@/lib/products.supabase';
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

type ProductSearchParams = Record<string, string | string[] | undefined>;
type MaybeProductSearchParams = ProductSearchParams | Promise<ProductSearchParams | undefined> | undefined;

interface ProductPageProps {
	params: { slug: string };
	searchParams?: MaybeProductSearchParams;
}

async function buildQueryString(searchParams?: MaybeProductSearchParams): Promise<string> {
	const resolved = searchParams ? await searchParams : null;
	if (!resolved) return '';
	const qs = new URLSearchParams();
	for (const [key, raw] of Object.entries(resolved)) {
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	let product = await fetchProductBySlug(resolvedParams.slug, { locale: 'lt' });

	if (!product && resolvedParams.slug.includes('--') && supabaseAdmin) {
		const columnsToTry = ['slug', 'slug_en'] as const;
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
			title: 'Produktas nerastas',
			description: 'Prašomas produktas nerastas.',
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

export default async function ProduktasPage({ params, searchParams }: ProductPageProps) {
	const resolvedParams = await params;
	let product = await fetchProductBySlug(resolvedParams.slug, { locale: 'lt' });

	if (!product && resolvedParams.slug.includes('--') && supabaseAdmin) {
		const columnsToTry = ['slug', 'slug_en'] as const;
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

	// Enforce canonical slug for the active locale.
	// Prevents mixed URLs like /lt/produktai/<english-slug> for LT pages.
	const canonicalSlug = currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug;
	if (!resolvedParams.slug.includes('--') && canonicalSlug && resolvedParams.slug !== canonicalSlug) {
		const target = toLocalePath(`/products/${canonicalSlug}`, currentLocale);
		const qs = await buildQueryString(searchParams);
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

	const displayName = currentLocale === 'en' && product.nameEn ? product.nameEn : product.name;
	const displayDescription =
		currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
	const hasSale =
		typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price;
	const offerPrice = hasSale ? product.salePrice! : product.price;

	const slugForLocale = canonicalSlug;

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

	let allProducts: Product[] = [];
	try {
		const stockItems = await fetchProducts({ mode: 'stock-items' });
		allProducts = stockItems.length > 0 ? stockItems : await fetchProducts({ mode: 'active' });
	} catch (stockError) {
		console.warn('Stock items unavailable, falling back to active products.', stockError);
		allProducts = await fetchProducts({ mode: 'active' });
	}
	const sameCategoryOrWood = allProducts.filter((item) => {
		if (item.id === product.id) return false;
		const sameCategory = product.category && item.category === product.category;
		const sameWood = product.woodType && item.woodType === product.woodType;
		return Boolean(sameCategory || sameWood);
	});
	const relatedProducts = sameCategoryOrWood.slice(0, 4);
	if (relatedProducts.length < 4) {
		const fallback = allProducts.filter(
			(item) => item.id !== product.id && !relatedProducts.some((rel) => rel.id === item.id)
		);
		relatedProducts.push(...fallback.slice(0, 4 - relatedProducts.length));
	}

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>

			<ProductDetailClient product={product} relatedProducts={relatedProducts} />
		</>
	);
}
