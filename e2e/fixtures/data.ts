/**
 * Test user credentials for E2E tests
 */
export const testUsers = {
  customer: {
    email: 'demo@yakiwood.lt',
    password: 'demo123456',
  },
  admin: {
    email: 'admin@yakiwood.lt',
    password: 'demo123456',
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
  products: '/produktai',
  solutions: '/sprendimai',
  projects: '/projektai',
  about: '/apie',
  contact: '/kontaktai',
  login: '/login',
  register: '/register',
};
