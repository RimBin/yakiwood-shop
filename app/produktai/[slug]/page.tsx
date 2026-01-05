import type { Metadata } from 'next';
import ProductPage from '@/app/products/[slug]/page';
import { fetchProductBySlug } from '@/lib/products.sanity';
import { getProductOgImage } from '@/lib/og-image';

interface ProductPageProps {
	params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const product = await fetchProductBySlug(params.slug);

	if (!product) {
		return {
			title: 'Product Not Found',
			description: 'The requested product could not be found.',
		};
	}

	const ogImage = product.images?.[0] || product.image;
	const description = product.description || '';
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yakiwood.lt';

	return {
		title: product.name,
		description,
		openGraph: {
			title: product.name,
			description,
			images: [
				{
					url: getProductOgImage(ogImage),
					width: 1200,
					height: 630,
					alt: product.name,
				},
			],
			type: 'website',
			url: `${siteUrl}/produktai/${product.slug}`,
		},
		twitter: {
			card: 'summary_large_image',
			title: product.name,
			description,
			images: [getProductOgImage(ogImage)],
		},
	};
}

export default ProductPage;
