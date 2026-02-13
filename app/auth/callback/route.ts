import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSafeNextPath(value: string | null): string {
  if (!value) return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//')) return '/'
  return value
}

function getErrorRedirectUrl(request: Request, message: string): URL {
  const requestUrl = new URL(request.url)
  const url = new URL('/login', requestUrl.origin)
  url.searchParams.set('error', message)
  return url
}

function getLocaleAwareRegisterPath(nextPath: string): string {
  return nextPath === '/lt' || nextPath.startsWith('/lt/') ? '/lt/register' : '/register'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const code = requestUrl.searchParams.get('code')
  const nextPath = getSafeNextPath(requestUrl.searchParams.get('next'))
  const consentGiven = requestUrl.searchParams.get('consent') === '1'

  if (!code) {
    return NextResponse.redirect(getErrorRedirectUrl(request, 'OAuth code is missing'))
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(getErrorRedirectUrl(request, exchangeError.message || 'Nepavyko prisijungti su Google'))
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(getErrorRedirectUrl(request, userError?.message || 'Nepavyko gauti vartotojo sesijos'))
  }

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null

  const userEmail =
    typeof user.email === 'string' && user.email.length > 0
      ? user.email
      : typeof user.user_metadata?.email === 'string' && user.user_metadata.email.length > 0
        ? user.user_metadata.email
        : null

  if (!userEmail) {
    return NextResponse.redirect(getErrorRedirectUrl(request, 'Nepavyko nustatyti vartotojo el. pašto'))
  }

  // Upsert user profile (without selecting terms_accepted_at to avoid column issues)
  const { error: upsertError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        email: userEmail,
        full_name: fullName,
      },
      { onConflict: 'id' }
    )

  if (upsertError) {
    return NextResponse.redirect(getErrorRedirectUrl(request, upsertError.message || 'Nepavyko sukurti vartotojo profilio'))
  }

  // Separately check terms acceptance
  let termsAccepted = false
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('terms_accepted_at')
      .eq('id', user.id)
      .maybeSingle()
    termsAccepted = !!profile?.terms_accepted_at
  } catch {
    // If column doesn't exist yet, treat as not accepted
    termsAccepted = false
  }

  if (consentGiven && !termsAccepted) {
    const acceptedAt = new Date().toISOString()
    const { error: consentError } = await supabase
      .from('user_profiles')
      .update({ terms_accepted_at: acceptedAt })
      .eq('id', user.id)

    if (consentError) {
      return NextResponse.redirect(getErrorRedirectUrl(request, consentError.message || 'Nepavyko išsaugoti sutikimo'))
    }

    return NextResponse.redirect(new URL(nextPath, origin))
  }

  if (!termsAccepted) {
    const registerPath = getLocaleAwareRegisterPath(nextPath)
    const registerUrl = new URL(registerPath, origin)
    registerUrl.searchParams.set('complete', '1')
    registerUrl.searchParams.set('next', nextPath)
    return NextResponse.redirect(registerUrl)
  }

  return NextResponse.redirect(new URL(nextPath, origin))
}
