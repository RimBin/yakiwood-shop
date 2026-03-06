// Deprecated: localStorage-backed invoice PDF route.
// Use GET /api/account/invoices/[id]/pdf (requires auth).

import { NextRequest, NextResponse } from 'next/server';

type RouteContextParams = Record<string, string | string[] | undefined>

function normalizeIdParam(raw: string | string[] | undefined): string | null {
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0] ?? null
  return null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteContextParams> }
) {
  const rawId = (await context.params).id
  const id = normalizeIdParam(rawId)
  if (!id) {
    return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
  }
  return NextResponse.redirect(new URL(`/api/account/invoices/${id}/pdf`, request.url));
}
