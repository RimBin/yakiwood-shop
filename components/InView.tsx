'use client';

import { useEffect, useRef, useState } from 'react';

type InViewProps = {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export default function InView({
  children,
  className = '',
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: InViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <div ref={ref} className={`${className} ${isInView ? 'is-inview' : ''}`.trim()}>
      {children}
    </div>
  );
}
