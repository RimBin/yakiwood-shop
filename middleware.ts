import type { NextRequest } from 'next/server';

import { proxy, config as proxyConfig } from './proxy';

export const config = proxyConfig;

export default async function middleware(request: NextRequest) {
  return proxy(request);
}
