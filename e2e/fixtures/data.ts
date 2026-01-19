/**
 * Test user credentials for E2E tests
 */
export const testUsers = {
  customer: {
    email: 'user@yakiwood.lt',
    password: 'demo123',
  },
  admin: {
    email: 'admin@yakiwood.lt',
    password: 'demo123',
  },
};

/**
 * Test product data
 */
export const testProducts = {
  plank: {
    slug: 'plank',
    name: 'Plank',
    basePrice: 89,
  },
  cladding: {
    slug: 'cladding',
    name: 'Cladding',
    basePrice: 120,
  },
};

/**
 * Test routes for navigation
 */
export const routes = {
  home: '/',
  products: '/products',
  solutions: '/solutions',
  projects: '/projects',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
};
