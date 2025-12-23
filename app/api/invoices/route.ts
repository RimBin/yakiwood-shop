// Deprecated: localStorage-backed invoices API.
// Use GET /api/account/invoices (requires auth).

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/account/invoices', request.url));
}
