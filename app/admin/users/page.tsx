import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import UsersAdminClient from '@/components/admin/UsersAdminClient'
import { Breadcrumbs } from '@/components/ui'

export default async function AdminUsersPage() {
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

  const t = await getTranslations('adminUsers')

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
