import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/admin/*', '/account/*', '/studio/*'],
      },
    ],
    sitemap: 'https://yakiwood.lt/sitemap.xml',
  };
}
