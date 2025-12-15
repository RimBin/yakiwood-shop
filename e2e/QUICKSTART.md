# Playwright E2E Testing - Quick Start

## ✅ Setup Complete!

Playwright has been successfully configured for your yakiwood-website project.

## 📁 Files Created

### Configuration
- [playwright.config.ts](../playwright.config.ts) - Main Playwright configuration

### Test Utilities
- [e2e/utils/helpers.ts](utils/helpers.ts) - Helper functions (login, addToCart, navigateTo)
- [e2e/fixtures/data.ts](fixtures/data.ts) - Test data (users, products, routes)

### Test Files
- [e2e/homepage.spec.ts](homepage.spec.ts) - Homepage & navigation tests
- [e2e/products.spec.ts](products.spec.ts) - Product listing & search tests
- [e2e/cart.spec.ts](cart.spec.ts) - Shopping cart functionality tests
- [e2e/auth.spec.ts](auth.spec.ts) - Authentication tests
- [e2e/smoke.spec.ts](smoke.spec.ts) - Production smoke tests

## 🚀 Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run specific test by name
npx playwright test -g "should load homepage"
```

## 📊 Test Coverage

### Homepage (5 tests)
✓ Homepage loads  
✓ Navigation works  
✓ Mobile menu opens  
✓ Hero section displays  

### Products (5 tests)
✓ Product list displays  
✓ Product details page  
✓ Search functionality  
✓ Category filtering  
✓ Image loading  

### Cart (5 tests)
✓ Add to cart  
✓ Open cart sidebar  
✓ Update quantity  
✓ Remove items  
✓ Calculate totals  

### Auth (7 tests)
✓ Display login form  
✓ Invalid credentials error  
✓ Valid login  
✓ Display register form  
✓ Register link from login  
✓ Forgot password link  
✓ Logout  

### Smoke (10 tests)
✓ Homepage loads  
✓ All main routes load  
✓ Sitemap accessible  
✓ Robots.txt accessible  
✓ No console errors  
✓ Assets load  
✓ API health check  
✓ Meta tags present  
✓ Responsive design  
✓ Language attribute  

**Total: 32 E2E tests**

## 🎯 First Test Run

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Run smoke tests first** (quickest):
   ```bash
   npx playwright test e2e/smoke.spec.ts
   ```

3. **View test report**:
   ```bash
   npx playwright show-report
   ```

## 🔧 Configuration Details

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, Mobile Chrome
- **Auto-start server**: Yes (runs `npm run dev`)
- **Reporter**: HTML (generates report in `playwright-report/`)

## 💡 Tips

1. **Data-testid attributes**: Add to components for reliable selectors:
   ```tsx
   <button data-testid="add-to-cart">Į krepšelį</button>
   ```

2. **Test isolation**: Each test is independent (uses beforeEach for setup)

3. **Lithuanian routes**: Tests use `/produktai`, `/sprendimai`, etc.

4. **Helper functions**: Use provided helpers for common actions:
   ```typescript
   await login(page, testUsers.customer.email, testUsers.customer.password);
   await addToCart(page, 'plank');
   ```

5. **Test data**: Update [e2e/fixtures/data.ts](fixtures/data.ts) for your products

## 🐛 Troubleshooting

**Port already in use:**
```bash
npx kill-port 3000
```

**Browser not installed:**
```bash
npx playwright install chromium
```

**Update package.json devDependencies if needed:**
```json
"@playwright/test": "^1.49.0"
```

## 📚 Next Steps

1. Run tests to verify setup: `npm run test:e2e`
2. Add `data-testid` attributes to key components
3. Update test fixtures with real product data
4. Implement authentication if not yet done
5. Add tests for new features as you build them
6. Configure CI/CD pipeline to run tests

## 📖 Documentation

- Full guide: [e2e/README.md](README.md)
- Playwright docs: https://playwright.dev
- Best practices: https://playwright.dev/docs/best-practices

---

**Ready to test!** Start with: `npm run test:e2e:ui`
