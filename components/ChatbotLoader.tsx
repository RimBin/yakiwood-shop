'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ChatbotWidget = dynamic(() => import('@/components/ChatbotWidget'), {
  ssr: false,
});

export default function ChatbotLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const handle = win.requestIdleCallback(() => setShouldLoad(true), { timeout: 2500 });
      return () => win.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => setShouldLoad(true), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!shouldLoad) return null;
  return <ChatbotWidget />;
}
