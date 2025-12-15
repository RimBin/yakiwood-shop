# Playwright E2E Tests

Playwright end-to-end testing setup for yakiwood-website.

## Installation

Install Playwright and browsers:

```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run specific test
npx playwright test -g "should load homepage"
```

## Test Structure

```
e2e/
├── fixtures/
│   └── data.ts           # Test data (users, products, routes)
├── utils/
│   └── helpers.ts        # Helper functions (login, addToCart, etc.)
├── homepage.spec.ts      # Homepage and navigation tests
├── products.spec.ts      # Product listing and search tests
├── cart.spec.ts          # Shopping cart functionality tests
├── auth.spec.ts          # Authentication tests
└── smoke.spec.ts         # Production smoke tests
```

## Test Coverage

### Homepage Tests
- Homepage loads successfully
- Navigation links work
- Mobile menu functionality
- Hero section displays

### Product Tests
- Product list displays
- Product details page
- Search functionality
- Category filtering
- Image loading

### Cart Tests
- Add product to cart
- Open cart sidebar
- Update item quantity
- Remove items
- Calculate totals

### Auth Tests
- Display login/register forms
- Invalid credentials error
- Valid login flow
- Password reset link
- Logout functionality

### Smoke Tests
- All routes load (200 status)
- Sitemap accessible
- Robots.txt accessible
- No console errors
- CSS/JS assets load
- Meta tags present
- Responsive design
- Language attribute

## Configuration

Tests run on 3 browsers by default:
- Chromium (Desktop)
- Firefox (Desktop)
- Mobile Chrome (Pixel 5)

Base URL: `http://localhost:3000`

The dev server starts automatically when running tests.

## CI/CD

Tests are configured for CI with:
- 2 retries on failure
- 1 worker (sequential)
- HTML reporter for results

## Writing New Tests

1. Create a new `.spec.ts` file in `e2e/`
2. Import test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { login, addToCart } from './utils/helpers';
   import { testUsers, routes } from './fixtures/data';
   ```
3. Write tests using Playwright API
4. Run tests to verify

## Best Practices

- Use data-testid attributes for reliable selectors
- Keep tests independent (use beforeEach for setup)
- Use Lithuanian route names: `/produktai`, `/sprendimai`, etc.
- Reference translations from fixtures
- Mock external APIs when needed
- Use page object pattern for complex flows

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Browser installation:**
```bash
npx playwright install chromium firefox
```

**Update snapshots:**
```bash
npx playwright test --update-snapshots
```

**View test report:**
```bash
npx playwright show-report
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
