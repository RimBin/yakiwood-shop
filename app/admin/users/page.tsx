import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import UsersAdminClient from '@/components/admin/UsersAdminClient'
import { Breadcrumbs } from '@/components/ui'

function looksLikeJwt(value: string | undefined): boolean {
  if (!value) return false
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim())
}

export default async function AdminUsersPage() {
  const t = await getTranslations('adminUsers')

  // If Supabase keys are placeholders, SSR auth will never work.
  if (!looksLikeJwt(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: '/' },
            { label: t('breadcrumbs.admin'), href: '/admin' },
            { label: t('breadcrumbs.users') },
          ]}
        />
        <div className="mx-auto max-w-[960px] px-[20px] py-[24px]">
          <div className="rounded-[16px] border border-[#E1E1E1] bg-white p-[16px]">
            <h1 className="font-['DM_Sans'] text-[18px] text-[#161616]">{t('title')}</h1>
            <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
              Supabase nesukonfigūruotas arba raktai neteisingi. Įrašykite tikrus
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` ir `SUPABASE_SERVICE_ROLE_KEY` į `.env.local`,
              tada paleiskite `npm run demo:bootstrap-users`.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/users')
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), href: '/' },
          { label: t('breadcrumbs.admin'), href: '/admin' },
          { label: t('breadcrumbs.users') },
        ]}
      />
      <UsersAdminClient />
    </div>
  )
}
