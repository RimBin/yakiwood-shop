import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SEOAdminClient from '@/components/admin/SEOAdminClient'
import { AdminBody, AdminCard } from '@/components/admin/ui/AdminUI'

async function requireAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/seo')
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/')
  }
}

export default async function SEOAdminPage() {
  await requireAdminPage()
  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminCard>
        <SEOAdminClient />
      </AdminCard>
    </AdminBody>
  )
}
