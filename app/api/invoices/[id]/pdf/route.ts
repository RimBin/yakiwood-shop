// Deprecated: localStorage-backed invoice PDF route.
// Use GET /api/account/invoices/[id]/pdf (requires auth).

import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { id: string }
type RouteContext = { params: RouteParams } | { params: Promise<RouteParams> }

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return await context.params
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await resolveParams(context);
  return NextResponse.redirect(new URL(`/api/account/invoices/${id}/pdf`, request.url));
}
