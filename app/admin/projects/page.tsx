import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import { toLocalePath, type AppLocale } from '@/i18n/paths'
import ProjectsAdminClient from '@/components/admin/ProjectsAdminClient'
import { AdminBody } from '@/components/admin/ui/AdminUI'

async function requireAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = (await getLocale()) as AppLocale
    const redirectTo = toLocalePath('/admin/projects', locale)
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/')
  }
}

export default async function AdminProjectsPage() {
  await requireAdminPage()
  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <ProjectsAdminClient />
    </AdminBody>
  )
}
