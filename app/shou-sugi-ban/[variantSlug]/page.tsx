import { notFound } from 'next/navigation';
export const dynamic = 'force-static';

export function generateStaticParams() {
  return [];
}

export default function ShouSugiBanVariantLandingPage() {
  notFound();
}
