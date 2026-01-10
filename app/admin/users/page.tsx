import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import UsersAdminClient from '@/components/admin/UsersAdminClient'
import { Breadcrumbs } from '@/components/ui'
import { PageCover, PageLayout } from '@/components/shared/PageLayout'

function looksLikeJwt(value: string | undefined): boolean {
  if (!value) return false
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim())
}

export default async function AdminUsersPage() {
  const t = await getTranslations('adminUsers')

  // If Supabase keys are placeholders, SSR auth will never work.
  if (!looksLikeJwt(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return (
      <section className="w-full bg-[#E1E1E1] min-h-screen">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: '/' },
            { label: t('breadcrumbs.admin'), href: '/admin' },
            { label: t('breadcrumbs.users') },
          ]}
        />

        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[40px] md:text-[72px] leading-[0.95] tracking-[-1.6px] md:tracking-[-3.2px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {t('title')}
          </h1>
          <p className="mt-[12px] font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[720px]">
            {t('subtitle')}
          </p>
        </PageCover>

        <PageLayout>
          <div className="py-[24px] md:py-[40px]">
            <div className="rounded-[16px] border border-[#BBBBBB] bg-white p-[16px]">
              <p className="font-['Outfit'] text-[14px] text-[#535353]">
                Supabase nesukonfigūruotas arba raktai neteisingi. Įrašykite tikrus
                `NEXT_PUBLIC_SUPABASE_ANON_KEY` ir `SUPABASE_SERVICE_ROLE_KEY` į `.env.local`,
                tada paleiskite `npm run demo:bootstrap-users`.
              </p>
            </div>
          </div>
        </PageLayout>
      </section>
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
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), href: '/' },
          { label: t('breadcrumbs.admin'), href: '/admin' },
          { label: t('breadcrumbs.users') },
        ]}
      />

      <PageCover>
        <h1
          className="font-['DM_Sans'] font-light text-[40px] md:text-[72px] leading-[0.95] tracking-[-1.6px] md:tracking-[-3.2px] text-[#161616]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {t('title')}
        </h1>
        <p className="mt-[12px] font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[720px]">
          {t('subtitle')}
        </p>
      </PageCover>

      <PageLayout>
        <div className="py-[24px] md:py-[40px]">
          <UsersAdminClient />
        </div>
      </PageLayout>
    </section>
  )
}
