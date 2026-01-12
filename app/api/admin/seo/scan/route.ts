import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { scanSitePages } from '@/lib/seo/runtime-scanner'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export const runtime = 'nodejs'

function resolveOrigin(request: NextRequest): string {
  const requestOrigin = new URL(request.url).origin
  const override = request.nextUrl.searchParams.get('origin')

  if (override) {
    try {
      return new URL(override).origin
    } catch {
      // ignore invalid override and fall back
    }
  }

  // In dev/local, prefer the current server origin to avoid stale NEXT_PUBLIC_SITE_URL ports.
  if (process.env.NODE_ENV !== 'production') {
    return requestOrigin
  }

  return process.env.NEXT_PUBLIC_SITE_URL || requestOrigin
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const origin = resolveOrigin(request)

    const result = await scanSitePages({ origin })

    // Sort by path for stable UI
    result.pages.sort((a, b) => (a.path < b.path ? -1 : 1))

    return NextResponse.json({ pages: result.pages, origin, scannedAt: new Date().toISOString() })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    return jsonError(e?.message || 'Admin auth failed', status)
  }
}
