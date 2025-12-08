import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export interface AdminContext {
  supabase: SupabaseClient
  user: User
}

export class AdminAuthError extends Error {
  status = 401
}

function ensureServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase service role credentials are not configured')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null

  const [, token] = header.split(' ')
  return token || null
}

/**
 * Validates Supabase auth token and ensures the user email is in ADMIN_EMAILS.
 * Accepts Authorization: Bearer <access_token>.
 */
export async function requireAdmin(request: NextRequest): Promise<AdminContext> {
  const token = extractBearerToken(request)
  if (!token) {
    throw new AdminAuthError('Missing admin token')
  }

  const supabase = ensureServiceRoleClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw new AdminAuthError('Invalid or expired session')
  }

  const allowedEmails = getAdminEmails()
  const email = data.user.email?.toLowerCase()

  if (allowedEmails.length === 0) {
    throw new AdminAuthError('ADMIN_EMAILS is empty; no one is allowed to access admin APIs')
  }

  if (!email || !allowedEmails.includes(email)) {
    throw new AdminAuthError('User is not allowed to access admin APIs')
  }

  return { supabase, user: data.user }
}
