import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import UsersAdminClient from '@/components/admin/UsersAdminClient'
import { AdminBody, AdminCard } from '@/components/admin/ui/AdminUI'
import { toLocalePath, type AppLocale } from '@/i18n/paths'

function looksLikeJwt(value: string | undefined): boolean {
  if (!value) return false
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim())
}

export default async function AdminUsersPage() {
  // If Supabase keys are placeholders, SSR auth will never work.
  if (!looksLikeJwt(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return (
      <AdminBody className="pt-[clamp(16px,2vw,24px)]">
        <AdminCard>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">
            Supabase nesukonfigūruotas arba raktai neteisingi. Įrašykite tikrus
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` ir `SUPABASE_SERVICE_ROLE_KEY` į `.env.local`,
            tada paleiskite `npm run demo:bootstrap-users`.
          </p>
        </AdminCard>
      </AdminBody>
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = (await getLocale()) as AppLocale
    const redirectTo = toLocalePath('/admin/users', locale)
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/')
  }

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminCard>
        <UsersAdminClient />
      </AdminCard>
    </AdminBody>
  )
}
