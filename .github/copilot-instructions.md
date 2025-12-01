# GitHub Copilot Instructions for yakiwood-website

AI agent guide for this Next.js e-commerce site built with Lithuanian localization, 3D product configurator, and Stripe payments.

## Big picture
- **Purpose**: E-commerce platform for Yakiwood burnt wood products (Shou Sugi Ban technique) targeting Lithuanian market
- **Tech stack**: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 + next-intl + Three.js + Zustand + Stripe + Supabase (planned)
- **Key flows**:
  1. User browses products → 3D configurator (color/finish) → adds to cart → Stripe checkout
  2. Lithuanian-only routes (`/produktai`, `/sprendimai`, `/projektai`, `/apie`, `/kontaktai`) via next-intl
  3. Figma MCP integration for pixel-perfect design implementation (designs at `ttxSg4wMtXPqfcQEh6B405`)

## Architecture & critical patterns
- **Localization strategy**: Single-locale (Lithuanian) hardcoded in `app/layout.tsx`; next-intl configured via `i18n/request.ts` + `next-intl.config.ts`. Messages in `messages/lt.json` use **nested object keys** (NOT dot-notation) to avoid runtime errors: `t('nav.produktai')` maps to `{"nav": {"produktai": "..."}}`.
- **Routing**: Lithuanian route names (`/produktai`, `/sprendimai`) + English folders (`/products`, `/solutions`) coexist; components reference Lithuanian slugs.
- **State management**: Zustand cart store (`lib/cart/store.ts`) handles cart items with `id + color + finish` merge logic. Cart persists in-memory only (no localStorage yet).
- **3D Configurator**: `components/Konfiguratorius3D.tsx` uses `@react-three/fiber` + drei; placeholder cube pending GLTF model replacement. Integrates with cart via `useCartStore().addItem()`.
- **Fonts**: Three Google Fonts loaded in `app/layout.tsx` as CSS variables: `--font-dm-sans` (300/400/500), `--font-outfit` (300/400), `--font-tiro-tamil` (400 italic). Reference via `font-['DM_Sans']` or `font-['Tiro_Tamil']`.
- **Styling**: Tailwind 4 via PostCSS plugin; **NO tailwind.config.js** by default. Inline utility classes + exact Figma color/spacing values (e.g., `#161616`, `tracking-[-1.6px]`). Images use Figma asset URLs (7-day expiry).

## Developer workflows
1. **Install dependencies**: `npm install --legacy-peer-deps` (required for React 19 compat)
2. **Dev server**: `npm run dev` → http://localhost:3000 (or port 3020 if 3000/3011 occupied)
3. **Build**: `npm run build` (Next.js production build)
4. **Tests**: `npm run test` (Jest + RTL; `npm run test:watch` for watch mode)
5. **Lint**: `npm run lint` (ESLint via `eslint.config.mjs`)
6. **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs lint + build on push/PR

### Supabase (currently disabled)
- Database schema: `supabase/seed.sql` defines products, variants, configurations, orders, cart_items
- Middleware: `middleware.ts` has Supabase session update commented out (missing env keys)
- Re-enable: Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, uncomment `updateSession()` call

### Stripe checkout
- Route: `app/api/checkout/route.ts` (creates Checkout Session from cart items)
- Frontend integration: pending cart UI button to trigger `/api/checkout`
- Webhook: not yet implemented (needed for order fulfillment)

### Figma workflow
- Designs stored in file `ttxSg4wMtXPqfcQEh6B405` with node IDs (e.g., `759:7549` for mobile homepage)
- Use Figma MCP tools: `mcp_figma2_get_design_context` (code + assets), `mcp_figma2_get_screenshot` (visual reference)
- Asset URLs expire in 7 days; for production, move to `public/` or CDN

## Project-specific conventions
- **TypeScript strict mode**: Enabled in `tsconfig.json`; avoid `any`, use proper types
- **Absolute imports**: `@/*` alias maps to project root (e.g., `import { useCartStore } from '@/lib/cart/store'`)
- **Component structure**:
  - Presentational components: `components/` (Header, Hero, Products, etc.)
  - Client components: Mark with `"use client"` directive (e.g., `Solutions.tsx`, `Konfiguratorius3D.tsx`)
  - Server components: Default in `app/` router (no directive needed)
- **Translation keys**: Use nested dot-notation (`t('nav.produktai')`) but store as nested objects in `messages/lt.json` (`{"nav": {"produktai": "..."}}`)
- **Cart logic**: Add items via `useCartStore().addItem()` with `id`, `color`, `finish` – duplicate combos merge quantities
- **Styling patterns**:
  - Font families: `font-['DM_Sans']`, `font-['Outfit']`, `font-['Tiro_Tamil']` (loaded as CSS vars in layout)
  - Colors: `#161616` (black), `#FFFFFF` (white), `#E1E1E1` (grey), `#BBBBBB` (light-grey), `#535353` (dark-grey), `#EAEAEA` (bg-grey)
  - Letter-spacing: Negative tracking common (e.g., `tracking-[-1.6px]`, `tracking-[-0.96px]`)
  - Border radius: `rounded-[24px]`, `rounded-[100px]` for buttons
- **Test pattern**: Co-locate tests with components (`Header.test.tsx` next to `Header.tsx`)

### Examples
**Add new route**:
```tsx
// app/naujienos/page.tsx
export default function Naujienos() {
  return <div>Naujienos content</div>;
}
```
Then link from Header: `<a href="/naujienos">{t('nav.naujienos')}</a>`

**Add translation**:
```json
// messages/lt.json
{
  "nav": {
    "naujienos": "Naujienos"  // Add here, NOT "nav.naujienos": "Naujienos"
  }
}
```

**Use cart store**:
```tsx
import { useCartStore } from '@/lib/cart/store';

function AddButton() {
  const addItem = useCartStore(state => state.addItem);
  return <button onClick={() => addItem({ id: '1', name: 'Plank', slug: 'plank', basePrice: 89 })}>Add</button>;
}
```

## Integration points & external dependencies
- **Fonts**: `next/font/google` in `app/layout.tsx` (DM Sans, Outfit, Tiro Tamil)
- **Tailwind**: v4 via `@tailwindcss/postcss` plugin; NO `tailwind.config.js` (use inline utilities)
- **Images**: Figma asset URLs configured in `next.config.ts` remotePatterns; 7-day expiry (move to `public/` for prod)
- **Translations**: `next-intl` with config at `i18n/request.ts` + `next-intl.config.ts`; wraps app in `NextIntlClientProvider`
- **3D**: `@react-three/fiber` + `@react-three/drei` + `three` for WebGL canvas (placeholder cube, awaiting GLTF models)
- **Payments**: Stripe (`stripe` + `@stripe/stripe-js`); checkout route exists, webhook pending
- **Database**: Supabase client configured but disabled; schema in `supabase/seed.sql` (products, variants, configurations, orders)

## Tests & CI
- **Test framework**: Jest + React Testing Library (`jest.config.cjs`, `jest.setup.ts`)
- **Run tests**: `npm run test` (single run) or `npm run test:watch` (watch mode)
- **Test location**: Co-located with components (e.g., `components/Header.test.tsx`)
- **CI pipeline**: `.github/workflows/ci.yml` runs `npm ci --legacy-peer-deps`, lint, build on every push/PR
- **Coverage**: Not configured; add `--coverage` flag if needed

## Troubleshooting & debugging
- **Translation errors** ("invalid namespace keys"): Ensure `messages/lt.json` uses nested objects, not dot-notation strings
- **Port conflicts** (EADDRINUSE 3000): Use `npm run dev -- -p 3020` to override port
- **Supabase errors**: Middleware disabled by default; enable by adding env keys and uncommenting `updateSession()` in `middleware.ts`
- **React 19 peer deps**: Always use `npm install --legacy-peer-deps` when installing packages
- **Font not loading**: Check CSS variable names in `app/layout.tsx` match Tailwind font classes (e.g., `--font-dm-sans` → `font-['DM_Sans']`)
- **3D scene blank**: Ensure `"use client"` directive in `Konfiguratorius3D.tsx`; check browser console for Three.js errors
- **Locale undefined**: Verify fallback logic in `i18n/request.ts` defaults to `'lt'`

## Examples + quick tasks
- To add a new route:
  1. Create `app/newpage/page.tsx` and export a default React component. 
  2. Link to it from `Header.tsx` or other components.
- To add a component using fonts: import `DM_Sans` or other font from `next/font/google` and use `className={font.variable}` in root or element.
- Convert images to `next/image`:
  1. Add `images: { domains: ['www.figma.com'] }` to `next.config.ts`.
  2. Replace `<img src=...>` with `import Image from 'next/image'` then `<Image src=... width=... height=... alt='' />`.

Example (Header logo):
```tsx
import Image from 'next/image'
const logo = 'https://www.figma.com/api/mcp/...'
<Image src={logo} alt="Logo" width={126} height={48} />
```

Export & static builds:
- The Next.js `app` router and server components are not fully compatible with `next export` (static export). For a static HTML export you can either:
  - Convert the app to the `pages` router and avoid dynamic server rendering features, or
  - Deploy to a platform that supports server-side rendering like Vercel (recommended). Vercel can serve this app as a static site where possible and handle server components.

CI/deployment tip: the included workflow performs `npm run build` — if you use Vercel, it will automatically build and deploy on push. If you need to export static assets via `next export`, we can add instructions but it may require router changes.

## When to ask the repo owner
- If you need real Supabase credentials or want to re-enable database integration
- If you need Stripe webhook secrets or production payment configuration
- If you want to replace placeholder 3D cube with real GLTF product models
- If you need to add new locales beyond Lithuanian (`lt`)
- If Figma asset URLs expire and you need fresh exports or want to migrate to `public/` folder
- If you need to implement cart persistence (localStorage/session) or cart UI overlay

---

**Quick reference**:
- **Ports**: 3000 (default), 3020 (fallback)
- **Locales**: `lt` (single-locale, hardcoded)
- **Routes**: `/produktai`, `/sprendimai`, `/projektai`, `/apie`, `/kontaktai`
- **Figma file**: `ttxSg4wMtXPqfcQEh6B405`
- **Brand colors**: `#161616` (black), `#E1E1E1` (grey), `#BBBBBB` (light-grey)

For questions or updates to these instructions, contact the repo owner.