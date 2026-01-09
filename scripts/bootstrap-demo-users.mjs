import fs from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) return
    const eqIndex = line.indexOf('=')
    if (eqIndex <= 0) return

    const key = line.slice(0, eqIndex).trim()
    let value = line.slice(eqIndex + 1).trim()

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  })
}

function loadEnvFromProjectRoot() {
  const root = process.cwd()
  // Minimal Next-like precedence.
  loadDotEnvFile(path.join(root, '.env.local'))
  loadDotEnvFile(path.join(root, '.env'))
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

function looksLikeJwt(value) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(String(value).trim())
}

async function findUserIdByEmail(supabase, email) {
  const emailLower = email.toLowerCase()

  // Supabase Admin API doesn't provide direct lookup by email;
  // list and search in-memory.
  const perPage = 200
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const found = data?.users?.find((u) => (u.email || '').toLowerCase() === emailLower)
    if (found?.id) return found.id

    if (!data?.users || data.users.length < perPage) return null
  }

  return null
}

async function ensureUser({ supabase, email, password, fullName, role }) {
  const existingUserId = await findUserIdByEmail(supabase, email)

  let userId = existingUserId
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error
    userId = data.user?.id
  } else {
    // Make it idempotent: ensure the demo password works and email is confirmed.
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    })
    if (error) throw error
  }

  if (!userId) {
    throw new Error(`Could not resolve user id for ${email}`)
  }

  // Ensure profile exists + correct role.
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    const message = String(profileError.message || '')
    if (message.includes("Could not find the table") || message.includes('schema cache')) {
      // eslint-disable-next-line no-console
      console.warn(
        '⚠️  user_profiles table is missing in your Supabase DB. Auth user was created/updated, but profile/role was not saved. Run the SQL migrations in supabase/migrations to create tables.'
      )
    } else {
      throw profileError
    }
  }

  return userId
}

async function main() {
  loadEnvFromProjectRoot()

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!looksLikeJwt(serviceRoleKey)) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not a valid JWT. Open Supabase Dashboard → Project Settings → API and copy the "service_role" key into .env.local.'
    )
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const demoPassword = 'demo123'

  const adminId = await ensureUser({
    supabase,
    email: 'admin@yakiwood.lt',
    password: demoPassword,
    fullName: 'Admin User',
    role: 'admin',
  })

  const userId = await ensureUser({
    supabase,
    email: 'user@yakiwood.lt',
    password: demoPassword,
    fullName: 'Demo User',
    role: 'user',
  })

  // eslint-disable-next-line no-console
  console.log('✅ Demo users ensured:')
  // eslint-disable-next-line no-console
  console.log(`- admin@yakiwood.lt (id: ${adminId}) password: ${demoPassword}`)
  // eslint-disable-next-line no-console
  console.log(`- user@yakiwood.lt (id: ${userId}) password: ${demoPassword}`)
  // eslint-disable-next-line no-console
  console.log('Next: set ADMIN_EMAILS=admin@yakiwood.lt and login via /login.')
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to bootstrap demo users')
  // eslint-disable-next-line no-console
  console.error(err?.message || err)
  process.exit(1)
})
