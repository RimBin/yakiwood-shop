import Products from '@/app/products/page';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Produktai - Shou Sugi Ban Degintas Medis',
  description: 'Naršykite mūsų premium Shou Sugi Ban deginto medžio produktų kolekciją. Fasadai, panelės, terasinė danga ir individualūs sprendimai su įvairiais apdailomis ir spalvomis.',
  openGraph: {
    title: 'Produktai - Yakiwood Shou Sugi Ban',
    description: 'Naršykite mūsų premium Shou Sugi Ban deginto medžio produktų kolekciją.',
    url: 'https://yakiwood.lt/produktai',
    images: [{ url: getOgImage('products'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('products')],
  },
};

export default Products;
