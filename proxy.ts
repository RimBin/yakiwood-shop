import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Enable Supabase session syncing only when credentials are present, so local
// development without keys keeps working.
const hasSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function proxy(request: NextRequest) {
  const response = hasSupabaseEnv
    ? await updateSession(request)
    : NextResponse.next()

  const { pathname } = request.nextUrl

  // Cache static assets aggressively
  if (
    pathname.startsWith('/assets') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images')
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache API responses with stale-while-revalidate
  if (pathname.startsWith('/api/products')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
  }

  // Cache newsletter API
  if (pathname.startsWith('/api/newsletter')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
