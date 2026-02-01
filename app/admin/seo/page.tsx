import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import SEOAdminClient from '@/components/admin/SEOAdminClient'
import { AdminBody, AdminCard, AdminSectionTitle, AdminStack } from '@/components/admin/ui/AdminUI'
import { getLocale } from 'next-intl/server'
import { toLocalePath, type AppLocale } from '@/i18n/paths'
import getSitemap from '@/app/sitemap'

async function requireAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = (await getLocale()) as AppLocale
    const redirectTo = toLocalePath('/admin/seo', locale)
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

export default async function SEOAdminPage() {
  await requireAdminPage()
  const rawHeaders = await headers()
  const headerList = rawHeaders instanceof Headers ? rawHeaders : new Headers(rawHeaders as any)
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`
  const items = await getSitemap()
  const sitemapLinks = items
    .map((item) => {
      try {
        const url = new URL(item.url)
        return `${origin}${url.pathname}`
      } catch {
        return item.url
      }
    })
    .sort((a, b) => a.localeCompare(b))
  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminStack>
        <AdminCard>
          <SEOAdminClient />
        </AdminCard>
        <AdminCard>
          <AdminSectionTitle className="mb-[16px]">Svetainės žemėlapis</AdminSectionTitle>
          <ul className="space-y-[8px] max-h-[420px] overflow-auto pr-[8px]">
            {sitemapLinks.map((href) => (
              <li key={href} className="font-['Outfit'] text-[14px] text-[#161616]">
                {href}
              </li>
            ))}
          </ul>
        </AdminCard>
      </AdminStack>
    </AdminBody>
  )
}
