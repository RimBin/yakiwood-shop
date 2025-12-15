This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Setup

**First time setup:**

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your values
# See docs/ENVIRONMENT.md for detailed setup guide
```

**Validate your configuration:**

```bash
# Check required variables
npm run env:check

# Check and test API connections
npm run env:validate
```

📖 **Full documentation:** [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Run Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Figma Assets

Figma asset URLs expire roughly every 7 days. To keep images stable, download them locally.

Manifest: `public/assets/figma-manifest.json` lists all remote asset keys and URLs.

Download all assets:

```bash
node scripts/download-figma-assets.js
```

Assets are saved to `public/assets/<key>.jpg|png|webp` (extension chosen from response content-type).

Use helper in components:

```ts
import { getAsset } from '@/lib/assets';
const src = getAsset('imgProject1'); // returns local file if exists, else remote fallback
```

Add new asset:
1. Append key + URL to `figma-manifest.json`
2. Re-run the download script
3. Reference with `getAsset(key)`

## Learn More

## Testing

This project uses Jest + React Testing Library for unit tests. Run tests locally with:

```powershell
npm install --legacy-peer-deps
npm run test
```

Add tests near components (e.g., `components/Header.test.tsx`).

## Deploy on Vercel

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
