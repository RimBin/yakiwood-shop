'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="font-['DM_Sans'] text-xl font-medium text-[#161616]">Supabase nesukonfigūruotas</h2>
        <p className="mt-2 font-['Outfit'] text-sm text-[#535353]">
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-['DM_Sans'] text-xl font-medium text-[#161616]">Storis</h2>
            <p className="mt-1 font-['Outfit'] text-sm text-[#535353]">
              Leidžiami pasirinkimai: <strong>18/20</strong> ir <strong>28</strong>.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => ensureOption(20)}
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] text-sm disabled:opacity-60"
            >
              + 18/20
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => ensureOption(28)}
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] text-sm disabled:opacity-60"
            >
              + 28
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-3">
            <p className="font-['Outfit'] text-sm text-red-700">{error}</p>
            <p className="mt-1 font-['Outfit'] text-xs text-red-700">
              Jei klaida apie `catalog_options`, pirmiausia pritaikykite migraciją
              `supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql`.
            </p>
          </div>
        ) : null}

        <div className="mt-6">
          {sorted.length === 0 ? (
            <p className="font-['Outfit'] text-sm text-[#535353]">Nėra įvestų storio pasirinkimų.</p>
          ) : (
            <div className="divide-y divide-[#E1E1E1] border border-[#E1E1E1] rounded-lg overflow-hidden">
              {sorted.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between px-4 py-3 bg-white">
                  <div className="flex flex-col">
                    <p className="font-['DM_Sans'] text-sm font-medium text-[#161616]">{labelForMm(opt.value_mm)}</p>
                    <p className="font-['Outfit'] text-xs text-[#7C7C7C]">
                      id: {opt.id.slice(0, 8)}… • aktyvus: {(opt.is_active ?? true) ? 'taip' : 'ne'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => removeOption(opt.id)}
                    className="px-3 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] text-sm text-[#161616] hover:bg-[#FAFAFA] disabled:opacity-60"
                  >
                    Trinti
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="font-['DM_Sans'] text-lg font-medium text-[#161616]">Kaip tai naudojama</h3>
        <p className="mt-2 font-['Outfit'] text-sm text-[#535353]">
          Šie įrašai skirti kainodarai per `product_configuration_prices.thickness_option_id`.
          Kitas žingsnis – pridėti storio pasirinkimą į konfigūratorių/krepšelį ir perduoti į kainos skaičiavimą.
        </p>
      </div>
    </div>
  )
}
