import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PUBLIC_FILE = /\.[^/]+$/

type PrefixMap = Array<{ from: string; to: string }>

const ltToEn: PrefixMap = [
  { from: '/apie', to: '/about' },
  { from: '/kontaktai', to: '/contact' },
  { from: '/duk', to: '/faq' },
  { from: '/produktai', to: '/products' },
  { from: '/sprendimai', to: '/solutions' },
  { from: '/projektai', to: '/projects' },
  { from: '/konfiguratorius3d', to: '/configurator3d' },
]

function replaceLeadingPath(pathname: string, mapping: PrefixMap): string {
  for (const { from, to } of mapping) {
    if (pathname === from || pathname.startsWith(`${from}/`)) {
      return pathname.replace(from, to)
    }
  }
  return pathname
}

function applyCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }
}

function stripEnPrefixFromUrlString(value: string): string {
  // next-intl middleware may emit absolute URLs in Location/x-middleware-rewrite.
  // Normalize any accidental /en prefix back to EN canonical (no prefix).
  try {
    const url = new URL(value)
    if (url.pathname === '/en' || url.pathname.startsWith('/en/')) {
      url.pathname = url.pathname === '/en' ? '/' : url.pathname.replace(/^\/en/, '')
      return url.toString()
    }
    return value
  } catch {
    if (value === '/en' || value.startsWith('/en/')) {
      return value === '/en' ? '/' : value.replace(/^\/en/, '')
    }
    return value
  }
}

// Enable Supabase session syncing only when credentials are present, so local
// development without keys keeps working.
const hasSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function proxy(request: NextRequest) {
  const supabaseResponse = hasSupabaseEnv
    ? await updateSession(request)
    : NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Always skip Next.js internals.
  if (
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return supabaseResponse
  }

  // Non-page requests that still benefit from caching/session syncing.
  if (pathname.startsWith('/api')) {
    const response = supabaseResponse

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

  if (
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  ) {
    const response = supabaseResponse
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Prevent duplicate EN URLs.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/en' ? '/' : pathname.replace(/^\/en/, '')
    const redirectResponse = NextResponse.redirect(url, 301)
    applyCookies(redirectResponse, supabaseResponse)
    return redirectResponse
  }

  // Legacy Lithuanian slugs without /lt should redirect to the new /lt/* canonical URLs.
  const legacyLtPrefixes: PrefixMap = [
    { from: '/apie', to: '/lt/apie' },
    { from: '/kontaktai', to: '/lt/kontaktai' },
    { from: '/duk', to: '/lt/duk' },
    { from: '/produktai', to: '/lt/produktai' },
    { from: '/sprendimai', to: '/lt/sprendimai' },
    { from: '/projektai', to: '/lt/projektai' },
    { from: '/konfiguratorius3d', to: '/lt/konfiguratorius3d' },
  ]

  for (const { from, to } of legacyLtPrefixes) {
    if (pathname === from || pathname.startsWith(`${from}/`)) {
      const url = request.nextUrl.clone()
      const remainder = pathname.slice(from.length)
      url.pathname = `${to}${remainder}`
      const redirectResponse = NextResponse.redirect(url, 301)
      applyCookies(redirectResponse, supabaseResponse)
      return redirectResponse
    }
  }

  // Let next-intl determine the locale from the URL.
  const intlResponse = intlMiddleware(request)

  // Enforce canonical EN URLs even if middleware emits /en.
  const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite')
  if (rewriteHeader) {
    const fixed = stripEnPrefixFromUrlString(rewriteHeader)
    if (fixed !== rewriteHeader) {
      intlResponse.headers.set('x-middleware-rewrite', fixed)
    }
  }

  const locationHeader = intlResponse.headers.get('location')
  if (locationHeader) {
    const fixed = stripEnPrefixFromUrlString(locationHeader)
    if (fixed !== locationHeader) {
      intlResponse.headers.set('location', fixed)
    }
  }

  // For /lt/*, rewrite to the internal EN routes while keeping locale=lt.
  if (pathname === '/lt' || pathname.startsWith('/lt/')) {
    const internalUrl = request.nextUrl.clone()

    const withoutPrefix = pathname === '/lt' ? '/' : pathname.slice(3)
    const mapped = replaceLeadingPath(withoutPrefix, ltToEn)
    internalUrl.pathname = mapped

    const rewriteResponse = NextResponse.rewrite(internalUrl)

    // Preserve locale headers/cookies that next-intl middleware set.
    intlResponse.headers.forEach((value, key) => {
      rewriteResponse.headers.set(key, value)
    })
    applyCookies(rewriteResponse, intlResponse)

    // Preserve Supabase cookies.
    applyCookies(rewriteResponse, supabaseResponse)

    return rewriteResponse
  }

  // Preserve Supabase cookies for all other paths.
  applyCookies(intlResponse, supabaseResponse)

  const response = intlResponse

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
