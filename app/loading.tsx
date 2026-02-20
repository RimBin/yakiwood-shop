"use client";

import { usePathname } from "next/navigation";
import AnimatedLogoLoader from '@/components/ui/AnimatedLogoLoader';

export default function Loading() {
  const pathname = usePathname() || "";
  const isEn = pathname.startsWith("/en") || pathname === "/en";
  const text = isEn ? "Loading..." : "Kraunama...";

  return <AnimatedLogoLoader fullScreen text={text} />;
}