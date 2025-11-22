# GitHub Copilot Instructions for yakiwood-website

These instructions help an AI agent (Copilot / other assistant) be productive working on this Next.js app.

## Big picture
- This is a static marketing site built with Next.js (app router) and Tailwind CSS. The repo focuses on static pages/components rather than server endpoints.
- Key folders:
  - `app/` — Next.js App Router pages and layouts (`app/layout.tsx`, `app/page.tsx`).
  - `components/` — Small UI components (e.g., `Header.tsx`, `Hero.tsx`).
  - `public/` — static assets.

## Architecture & patterns
- App uses the Next.js `app/` directory pattern; pages are React server components by default. `layout.tsx` controls global layout and fonts.
- Absolute imports use a `@/*` alias — see `tsconfig.json` paths. Use `import Header from '@/components/Header'`.
- Fonts are loaded using `next/font/google` in `app/layout.tsx`. Follow the pattern when adding new fonts or variables.
- Styles: Tailwind is configured via PostCSS (`postcss.config.mjs`) and loaded in `app/globals.css`. There's no `tailwind.config.js` file in this scaffold — modify `globals.css` and `tailwind` if you add a config.
- Images: components use external Figma URLs for assets; images are standard `<img>` elements (not `next/image`), so there is no image domain config in `next.config.ts`. If you switch to `next/image`, update `next.config.ts` to add the hosting domain.

## Developer workflows (commands)
- Start dev server: `npm run dev` (runs `next dev`) — check http://localhost:3000.
- Build site: `npm run build` (runs `next build`).
- Run in production mode locally: `npm run start`.
- Lint code: `npm run lint` (runs `eslint`).
 - Run unit tests: `npm run test` (uses Jest + React Testing Library). If you have trouble installing dev deps with npm and React 19, use `npm install --legacy-peer-deps`.

Note: this repo includes a GitHub Actions workflow for basic CI (lint + build) under `.github/workflows/ci.yml`. Commits pushed to `main`/`master` and PRs run checks automatically.

Tip: if adding `next/image`, add domains in `next.config.ts` (use `remotePatterns` recommended by Next.js):
```ts
export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.figma.com', pathname: '/**' }
    ]
  }
}
```

## Project-specific conventions
- Use TypeScript (`.tsx`/`.ts`). Keep `strict: true` compiler checks in `tsconfig.json` in mind.
- Font variables are defined in `app/layout.tsx`; use CSS variables for font-family if you need shared styles.
- Use Tailwind classes directly in JSX for layout and styling.
- Component CSS is global; there is no CSS module usage by default — prefer Tailwind utility classes for now.
- Small UI components live in `components/` and are mostly presentational; keep them stateless unless you add stateful behavior explicitly.

## Integration points & external dependencies
- Fonts: `next/font/google` in `app/layout.tsx`.
- Tailwind via `@tailwindcss/postcss` plugin in `postcss.config.mjs`.
- Images: external Figma asset URLs are used; for offline builds or production reliability, consider moving assets to `public/`.

## Tests & CI
- Unit tests: This repo uses Jest + React Testing Library. Tests live near components (example: `components/Header.test.tsx`).
- To run tests locally: `npm run test`.
- The GitHub Actions CI runs tests in `.github/workflows/ci.yml`; it uses `npm ci --legacy-peer-deps` to ensure dev peer dependencies install alongside React 19.

## Troubleshooting & debugging
- If styles are missing in dev: ensure packages are installed (`npm i`) and `npm run dev` restarted after edits to `postcss` or `globals.css`.
- If linting fails, run `npm run lint`; configuration is in `eslint.config.mjs` and uses `eslint-config-next` rules.
- If `import '@/...'` fails, confirm `paths` in `tsconfig.json` include `"@/*": ["./*"]`.

## Examples + quick tasks
- To add a new route:
  1. Create `app/newpage/page.tsx` and export a default React component. 
  2. Link to it from `Header.tsx` or other components.
- To add a component using fonts: import `DM_Sans` or other font from `next/font/google` and use `className={font.variable}` in root or element.
- Convert images to `next/image`:
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
- If you need a backend API or dynamic data source — none exists here currently.
- If you need a Tailwind config (custom screens, colors), request access/approval to add `tailwind.config.js`.
- If you want to move Figma assets to `public/`, confirm desired filenames and caching policy.

---
If anything is unclear or you want the instructions focused on specific workflows (tests, CI, or Vercel deployment), tell me which area to expand. Thanks! 👋