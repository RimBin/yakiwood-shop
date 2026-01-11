import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/ui'
import ThicknessOptionsAdminClient from '../../../components/admin/ThicknessOptionsAdminClient'

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/options')
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    redirect('/')
  }

  return supabase
}

async function getThicknessOptions() {
  const supabase = await requireAdmin()

  const { data, error } = await supabase
    .from('catalog_options')
    .select('id, option_type, value_text, value_mm, label_lt, label_en, sort_order, is_active')
    .eq('option_type', 'thickness')
    .order('value_mm', { ascending: true, nullsFirst: true })

  if (error) {
    return { options: [], error: error.message }
  }

  return { options: (data as any[]) ?? [], error: null as string | null }
}

export default async function AdminOptionsPage() {
  const { options, error } = await getThicknessOptions()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Breadcrumbs
        items={[
          { label: 'Pradžia', href: '/' },
          { label: 'Administravimas', href: '/admin' },
          { label: 'Parinktys' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] tracking-[-0.96px]">
            Parinkčių valdymas
          </h1>
          <p className="mt-2 text-[#535353] font-['DM_Sans']">
            Valdykite globalias pasirinkimų reikšmes (kol kas: storis).
          </p>
        </div>

        <ThicknessOptionsAdminClient initialOptions={options} initialError={error} />
      </div>
    </div>
  )
}
