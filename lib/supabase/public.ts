import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function looksLikeJwt(value: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim())
}

/**
 * Public (anon) Supabase client.
 *
 * Works in both server and browser, relies on RLS for access control.
 * Returns null when env vars are missing to allow graceful fallback.
 */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) return null
  if (!looksLikeJwt(anonKey)) return null

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
