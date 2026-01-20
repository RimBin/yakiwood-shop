/**
 * JSON-LD Schema Generators for SEO
 * Use these to add structured data to your pages
 */

interface Product {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku?: string;
  brand?: string;
  inStock?: boolean;
}

interface Article {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Product schema for product pages
 */
export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Yakiwood',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EUR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://yakiwood.lt/products/${product.sku}`,
    },
    ...(product.sku && { sku: product.sku }),
  };
}

/**
 * Generate Article schema for blog posts and project pages
 */
export function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || 'Yakiwood',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Yakiwood',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yakiwood.lt/icon.svg',
      },
    },
  };
}

/**
 * Generate Breadcrumb schema for navigation
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate LocalBusiness schema (use on contact/about pages)
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Yakiwood',
    description:
      'Premium Shou Sugi Ban burnt wood products delivered across the UK. Traditional Japanese technique for sustainable, beautiful, and durable wood surfaces.',
    url: 'https://yakiwood.lt',
    telephone: '+37067564733', // Updated phone number
    email: 'info@yakiwood.lt',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vilnius', // Update with real city
      addressCountry: 'LT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 54.6872, // Update with real coordinates
      longitude: 25.2797,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };
}

/**
 * Generate FAQPage schema for FAQ page
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
