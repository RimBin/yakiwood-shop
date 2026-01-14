import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThicknessOptionsAdminClient from '../../../components/admin/ThicknessOptionsAdminClient'
import ColorOptionsAdminClient from '../../../components/admin/ColorOptionsAdminClient'
import { AdminBody, AdminCard, AdminKicker, AdminSectionTitle, AdminStack } from '@/components/admin/ui/AdminUI'

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

async function getColorOptions() {
  const supabase = await requireAdmin()

  const { data, error } = await supabase
    .from('catalog_options')
    .select('id, option_type, value_text, value_mm, label_lt, label_en, hex_color, sort_order, is_active')
    .eq('option_type', 'color')
    .order('sort_order', { ascending: true, nullsFirst: true })

  if (error) {
    return { options: [], error: error.message }
  }

  return { options: (data as any[]) ?? [], error: null as string | null }
}

async function getColorAssets() {
  const supabase = await requireAdmin()

  const { data, error } = await supabase
    .from('product_assets')
    .select('id, asset_type, url, product_id, color_code, wood_type, usage_type, profile_variant_id, finish_variant_id, is_active')
    .eq('asset_type', 'photo')
    .is('product_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { assets: [], error: error.message }
  }

  return { assets: (data as any[]) ?? [], error: null as string | null }
}

export default async function AdminOptionsPage() {
  const { options, error } = await getThicknessOptions()
  const { options: colorOptions, error: colorError } = await getColorOptions()
  const { assets: colorAssets, error: colorAssetsError } = await getColorAssets()

  const combinedError = error ?? colorError ?? colorAssetsError

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminStack>
        <div>
          <AdminKicker>Parinktys</AdminKicker>
          <div className="mt-[8px]">
            <AdminSectionTitle>Parinkčių valdymas</AdminSectionTitle>
          </div>
          <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
            Valdykite globalias pasirinkimų reikšmes.
          </p>
        </div>

        <AdminCard>
          <ThicknessOptionsAdminClient initialOptions={options} initialError={combinedError} />
        </AdminCard>

        <AdminCard>
          <ColorOptionsAdminClient initialOptions={colorOptions} initialAssets={colorAssets} initialError={combinedError} />
        </AdminCard>
      </AdminStack>
    </AdminBody>
  )
}
