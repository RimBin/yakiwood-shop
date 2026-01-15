'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminButton, AdminKicker, AdminSectionTitle, AdminStack } from '@/components/admin/ui/AdminUI'

type ThicknessOptionRow = {
  id: string
  option_type: 'thickness'
  value_text: string | null
  value_mm: number | null
  label_lt: string | null
  label_en: string | null
  sort_order: number | null
  is_active: boolean | null
}

function labelForMm(valueMm: number | null): string {
  if (valueMm === 28) return '28 mm'
  if (valueMm === 20) return '18/20 mm'
  if (typeof valueMm === 'number') return `${valueMm} mm`
  return '-'
}

export default function ThicknessOptionsAdminClient({
  initialOptions,
  initialError,
}: {
  initialOptions: ThicknessOptionRow[]
  initialError: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const [options, setOptions] = useState<ThicknessOptionRow[]>(initialOptions)
  const [error, setError] = useState<string | null>(initialError)
  const [isBusy, setIsBusy] = useState(false)

  const sorted = useMemo(() => {
    return [...options].sort((a, b) => {
      const av = a.value_mm ?? 0
      const bv = b.value_mm ?? 0
      if (av !== bv) return av - bv
      return a.id.localeCompare(b.id)
    })
  }, [options])

  if (!supabase) {
    return (
      <div>
        <AdminKicker>Storis</AdminKicker>
        <div className="mt-[8px]">
          <AdminSectionTitle>Supabase nesukonfigūruotas</AdminSectionTitle>
        </div>
        <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
          Reikia `NEXT_PUBLIC_SUPABASE_URL` ir `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local` faile.
        </p>
      </div>
    )
  }

  const ensureOption = async (valueMm: number) => {
    setIsBusy(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('catalog_options')
        .insert({
          option_type: 'thickness',
          value_mm: valueMm,
          label_lt: valueMm === 20 ? '18/20 mm' : `${valueMm} mm`,
          label_en: valueMm === 20 ? '18/20 mm' : `${valueMm} mm`,
          sort_order: valueMm,
          is_active: true,
        })
        .select('id, option_type, value_text, value_mm, label_lt, label_en, sort_order, is_active')
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      if (data) {
        setOptions((prev) => [data as unknown as ThicknessOptionRow, ...prev])
      }
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  const removeOption = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį storio pasirinkimą?')) return

    setIsBusy(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase.from('catalog_options').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
        return
      }

      setOptions((prev) => prev.filter((o) => o.id !== id))
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <AdminStack>
      <div>
        <AdminKicker>Storis</AdminKicker>
        <div className="mt-[8px] flex items-start justify-between gap-[12px] flex-wrap">
          <div>
            <AdminSectionTitle>Storio pasirinkimai</AdminSectionTitle>
            <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
              Leidžiami pasirinkimai: <strong>18/20</strong> ir <strong>28</strong>.
            </p>
          </div>

          <div className="flex gap-[8px]">
            <AdminButton size="sm" disabled={isBusy} onClick={() => ensureOption(20)}>
              + 18/20
            </AdminButton>
            <AdminButton size="sm" disabled={isBusy} onClick={() => ensureOption(28)}>
              + 28
            </AdminButton>
          </div>
        </div>

        {error ? (
          <div className="mt-[16px] border border-red-200 bg-[#EAEAEA] rounded-[16px] p-[12px]">
            <p className="font-['Outfit'] text-[13px] text-red-700">{error}</p>
            <p className="mt-[6px] font-['Outfit'] text-[12px] text-red-700">
              Jei klaida apie `catalog_options`, pirmiausia pritaikykite migraciją
              `supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql`.
            </p>
          </div>
        ) : null}

        <div className="mt-[16px]">
          {sorted.length === 0 ? (
            <p className="font-['Outfit'] text-[14px] text-[#535353]">Nėra įvestų storio pasirinkimų.</p>
          ) : (
            <div className="divide-y divide-[#E1E1E1] border border-[#E1E1E1] rounded-[16px] overflow-hidden">
              {sorted.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between gap-[12px] px-[16px] py-[12px] bg-[#EAEAEA]">
                  <div className="min-w-0">
                    <p className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{labelForMm(opt.value_mm)}</p>
                    <p className="mt-[2px] font-['Outfit'] text-[12px] text-[#7C7C7C]">
                      id: {opt.id.slice(0, 8)}… • aktyvus: {(opt.is_active ?? true) ? 'taip' : 'ne'}
                    </p>
                  </div>
                  <AdminButton variant="danger" size="sm" disabled={isBusy} onClick={() => removeOption(opt.id)}>
                    Trinti
                  </AdminButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <AdminKicker>Pastaba</AdminKicker>
        <div className="mt-[8px]">
          <AdminSectionTitle>Kaip tai naudojama</AdminSectionTitle>
        </div>
        <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
          Šie įrašai skirti kainodarai per `product_configuration_prices.thickness_option_id`.
          Kitas žingsnis – pridėti storio pasirinkimą į konfigūratorių/krepšelį ir perduoti į kainos skaičiavimą.
        </p>
      </div>
    </AdminStack>
  )
}
