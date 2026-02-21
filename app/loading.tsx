"use client";

import { useLocale } from 'next-intl';
import AnimatedLogoLoader from '@/components/ui/AnimatedLogoLoader';

export default function Loading() {
  const locale = useLocale();
  const text = locale === 'en' ? 'Loading...' : 'Kraunama...';

  return <AnimatedLogoLoader fullScreen text={text} />;
}