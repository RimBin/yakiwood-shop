'use client'

import {useMemo, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'
import {AdminButton, AdminInput, AdminLabel, AdminSectionTitle, AdminStack} from '@/components/admin/ui/AdminUI'

type ColorOptionRow = {
  id: string
  option_type: 'color'
  value_text: string | null
  value_mm: number | null
  label_lt: string | null
  label_en: string | null
  hex_color: string | null
  sort_order: number | null
  is_active: boolean | null
}

type ColorAssetRow = {
  id: string
  asset_type: 'photo'
  url: string
  product_id: string | null
  color_code: string | null
  wood_type: string | null
  usage_type: string | null
  profile_variant_id: string | null
  finish_variant_id: string | null
  is_active: boolean | null
}

function normalizeHex(input: string): string {
  const v = input.trim()
  if (!v) return ''
  if (v.startsWith('#')) return v
  return `#${v}`
}

function isValidHex(input: string): boolean {
  const v = normalizeHex(input)
  return /^#[0-9A-Fa-f]{6}$/.test(v)
}

function safeCode(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ColorOptionsAdminClient({
  initialOptions,
  initialAssets,
  initialError,
}: {
  initialOptions: ColorOptionRow[]
  initialAssets: ColorAssetRow[]
  initialError: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const [options, setOptions] = useState<ColorOptionRow[]>(initialOptions)
  const [assets, setAssets] = useState<ColorAssetRow[]>(initialAssets)
  const [error, setError] = useState<string | null>(initialError)
  const [isBusy, setIsBusy] = useState(false)

  const [newCode, setNewCode] = useState('')
  const [newLabelLt, setNewLabelLt] = useState('')
  const [newLabelEn, setNewLabelEn] = useState('')
  const [newHex, setNewHex] = useState('')

  const fileInputsByKey = useRef<Record<string, HTMLInputElement | null>>({})

  const woodTypeOptions = useMemo(
    () => [
      {value: null as string | null, label: 'Visiems (bendras)'}
      ,
      {value: 'spruce', label: 'Eglė (spruce)'}
      ,
      {value: 'larch', label: 'Maumedis (larch)'}
    ],
    []
  )

  const sorted = useMemo(() => {
    return [...options].sort((a, b) => {
      const ao = a.sort_order ?? 0
      const bo = b.sort_order ?? 0
      if (ao !== bo) return ao - bo
      const av = a.value_text ?? ''
      const bv = b.value_text ?? ''
      return av.localeCompare(bv)
    })
  }, [options])

  const assetsByColor = useMemo(() => {
    const map = new Map<string, ColorAssetRow[]>()
    for (const a of assets) {
      const code = a.color_code ?? ''
      if (!code) continue
      const list = map.get(code) ?? []
      list.push(a)
      map.set(code, list)
    }
    for (const [code, list] of map.entries()) {
      list.sort((x, y) => x.id.localeCompare(y.id))
      map.set(code, list)
    }
    return map
  }, [assets])

  if (!supabase) {
    return (
      <div>
        <AdminSectionTitle>Supabase nesukonfigūruotas</AdminSectionTitle>
        <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
          Reikia `NEXT_PUBLIC_SUPABASE_URL` ir `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local` faile.
        </p>
      </div>
    )
  }

  const refreshFromDb = async () => {
    setIsBusy(true)
    setError(null)
    try {
      const {data: optData, error: optErr} = await supabase
        .from('catalog_options')
        .select('id, option_type, value_text, value_mm, label_lt, label_en, hex_color, sort_order, is_active')
        .eq('option_type', 'color')
        .order('sort_order', {ascending: true, nullsFirst: true})

      if (optErr) {
        setError(optErr.message)
        return
      }
      setOptions((optData as any[]) as ColorOptionRow[])

      const {data: assetData, error: assetErr} = await supabase
        .from('product_assets')
        .select(
          'id, asset_type, url, product_id, color_code, wood_type, usage_type, profile_variant_id, finish_variant_id, is_active'
        )
        .eq('asset_type', 'photo')
        .is('product_id', null)
        .order('created_at', {ascending: false})

      if (assetErr) {
        setError(assetErr.message)
        return
      }
      setAssets((assetData as any[]) as ColorAssetRow[])
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  const addColor = async () => {
    const code = safeCode(newCode)
    if (!code) {
      setError('Įveskite spalvos kodą (pvz. black, carbon-light).')
      return
    }

    const hex = newHex.trim() ? normalizeHex(newHex) : ''
    if (hex && !isValidHex(hex)) {
      setError('Hex spalva turi būti formatu #RRGGBB (pvz. #161616).')
      return
    }

    setIsBusy(true)
    setError(null)
    try {
      const {data, error: insertError} = await supabase
        .from('catalog_options')
        .insert({
          option_type: 'color',
          value_text: code,
          label_lt: newLabelLt.trim() || null,
          label_en: newLabelEn.trim() || null,
          hex_color: hex || null,
          sort_order: options.length,
          is_active: true,
        })
        .select('id, option_type, value_text, value_mm, label_lt, label_en, hex_color, sort_order, is_active')
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      if (data) setOptions((prev) => [data as unknown as ColorOptionRow, ...prev])
      setNewCode('')
      setNewLabelLt('')
      setNewLabelEn('')
      setNewHex('')
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  const toggleActive = async (id: string, nextActive: boolean) => {
    setIsBusy(true)
    setError(null)
    try {
      const {error: updateError} = await supabase
        .from('catalog_options')
        .update({is_active: nextActive})
        .eq('id', id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setOptions((prev) => prev.map((o) => (o.id === id ? {...o, is_active: nextActive} : o)))
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  const removeColor = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šią spalvą?')) return

    setIsBusy(true)
    setError(null)
    try {
      const {error: deleteError} = await supabase.from('catalog_options').delete().eq('id', id)
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

  const uploadColorPhotos = async (colorCode: string, woodType: string | null, files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsBusy(true)
    setError(null)
    try {
      const newAssets: ColorAssetRow[] = []

      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg'
        const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
        const path = `color-library/${colorCode}/${woodType ?? 'any'}/${key}.${ext}`

        const {error: uploadError} = await supabase.storage.from('product-images').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

        if (uploadError) {
          setError(uploadError.message)
          return
        }

        const {data: publicUrlData} = supabase.storage.from('product-images').getPublicUrl(path)
        const url = publicUrlData.publicUrl

        const {data: assetRow, error: insertErr} = await supabase
          .from('product_assets')
          .insert({
            product_id: null,
            asset_type: 'photo',
            url,
            color_code: colorCode,
            wood_type: woodType,
            usage_type: null,
            profile_variant_id: null,
            finish_variant_id: null,
            is_active: true,
          })
          .select('id, asset_type, url, product_id, color_code, wood_type, usage_type, profile_variant_id, finish_variant_id, is_active')
          .single()

        if (insertErr) {
          setError(insertErr.message)
          return
        }

        if (assetRow) newAssets.push(assetRow as unknown as ColorAssetRow)
      }

      if (newAssets.length > 0) {
        setAssets((prev) => [...newAssets, ...prev])
      }

      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  const deleteAsset = async (id: string) => {
    if (!confirm('Pašalinti šią nuotrauką?')) return

    setIsBusy(true)
    setError(null)
    try {
      // Hard delete row. We could also set is_active=false.
      const {error: deleteError} = await supabase.from('product_assets').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
        return
      }

      setAssets((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <AdminStack>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <AdminSectionTitle>Spalvų biblioteka</AdminSectionTitle>
          <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
              Čia sukuriate spalvas ir galite įkelti nuotraukas (rašoma į `product_assets` su `product_id = NULL`).
              Jei norite pvz. „spruce + black“ atskiros foto, įkelkite su pasirinkta mediena.
            </p>
        </div>

        <AdminButton type="button" variant="outline" size="sm" disabled={isBusy} onClick={refreshFromDb}>
          Atnaujinti
        </AdminButton>
      </div>

      {error ? (
        <div className="border border-red-200 bg-[#EAEAEA] rounded-[16px] px-[16px] py-[12px]">
          <p className="font-['Outfit'] text-[13px] text-red-700">{error}</p>
          <p className="mt-[4px] font-['Outfit'] text-[12px] text-red-700">
            Jei klaida apie `catalog_options`/`product_assets`, pirmiausia pritaikykite migraciją
            `supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql`.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(16px,2vw,24px)]">
        <div className="border border-[#E1E1E1] rounded-[16px] p-[clamp(16px,2vw,20px)]">
          <div className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">Pridėti spalvą</div>

          <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            <div>
              <AdminLabel className="mb-[6px]">Kodas (value_text)</AdminLabel>
              <AdminInput value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="black" />
            </div>
            <div>
              <AdminLabel className="mb-[6px]">Hex (nebūtina)</AdminLabel>
              <AdminInput value={newHex} onChange={(e) => setNewHex(e.target.value)} placeholder="#161616" />
            </div>
            <div>
              <AdminLabel className="mb-[6px]">Pavadinimas LT</AdminLabel>
              <AdminInput value={newLabelLt} onChange={(e) => setNewLabelLt(e.target.value)} placeholder="Juoda" />
            </div>
            <div>
              <AdminLabel className="mb-[6px]">Pavadinimas EN</AdminLabel>
              <AdminInput value={newLabelEn} onChange={(e) => setNewLabelEn(e.target.value)} placeholder="Black" />
            </div>
          </div>

          <div className="mt-[12px]">
            <AdminButton type="button" disabled={isBusy} onClick={addColor}>
              + Pridėti
            </AdminButton>
          </div>
        </div>

        <div className="border border-[#E1E1E1] rounded-[16px] p-[clamp(16px,2vw,20px)]">
          <div className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">Kaip naudoti</div>
          <ul className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353] list-disc pl-5 space-y-1">
              <li>Spalvos kodas (pvz. <code>black</code>) turi sutapti su tuo, ką siunčiate į kainodarą/konfigūraciją.</li>
              <li>Nuotraukos įkeliamos į Supabase Storage bucket <code>product-images</code>.</li>
              <li>Ryšys saugomas DB lentelėje <code>product_assets</code> per <code>color_code</code> ir (jei reikia) <code>wood_type</code>.</li>
            </ul>
        </div>
      </div>

      <div>
        {sorted.length === 0 ? (
          <p className="font-['Outfit'] text-[14px] text-[#535353]">Nėra įvestų spalvų.</p>
        ) : (
          <div className="divide-y divide-[#E1E1E1] border border-[#E1E1E1] rounded-[16px] overflow-hidden">
            {sorted.map((opt) => {
              const code = opt.value_text ?? ''
              const hex = opt.hex_color ?? ''
              const photos = code ? assetsByColor.get(code) ?? [] : []
              const byWood = new Map<string | null, ColorAssetRow[]>()
              for (const p of photos) {
                const wt = p.wood_type ?? null
                const list = byWood.get(wt) ?? []
                list.push(p)
                byWood.set(wt, list)
              }
              const label = opt.label_lt || opt.label_en || code || '(be kodo)'

              return (
                <div key={opt.id} className="px-[16px] py-[16px]">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-[#E1E1E1]"
                        style={{backgroundColor: isValidHex(hex) ? hex : '#EAEAEA'}}
                        title={hex || undefined}
                      />
                      <div>
                        <p className="font-['DM_Sans'] text-[14px] font-medium text-[#161616]">{label}</p>
                        <p className="font-['Outfit'] text-[12px] text-[#7C7C7C]">
                          code: <span className="font-mono">{code || '-'}</span> • aktyvus:{' '}
                          {(opt.is_active ?? true) ? 'taip' : 'ne'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <AdminButton
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => toggleActive(opt.id, !(opt.is_active ?? true))}
                      >
                        {(opt.is_active ?? true) ? 'Išjungti' : 'Įjungti'}
                      </AdminButton>
                      <AdminButton
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => removeColor(opt.id)}
                      >
                        Trinti
                      </AdminButton>
                    </div>
                  </div>

                  {code ? (
                    <div className="mt-4">
                      <div className="space-y-4">
                        {woodTypeOptions.map((wt) => {
                          const key = `${code}::${wt.value ?? 'any'}`
                          const list = byWood.get(wt.value) ?? []
                          return (
                            <div key={key} className="border border-[#E1E1E1] rounded-lg p-3">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <p className="font-['Outfit'] text-sm text-[#535353]">
                                    Nuotraukos ({wt.label}) • {list.length}
                                  </p>
                                  <div>
                                    <input
                                      ref={(el) => {
                                        fileInputsByKey.current[key] = el
                                      }}
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => uploadColorPhotos(code, wt.value, e.target.files)}
                                    />
                                    <AdminButton
                                      type="button"
                                      size="sm"
                                      disabled={isBusy}
                                      onClick={() => fileInputsByKey.current[key]?.click()}
                                    >
                                      + Įkelti
                                    </AdminButton>
                                  </div>
                                </div>

                                {list.length === 0 ? (
                                  <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">Dar nėra įkeltų nuotraukų.</p>
                                ) : (
                                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {list.map((p) => (
                                      <div key={p.id} className="relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={p.url}
                                          alt={`${code}-${wt.value ?? 'any'}`}
                                          className="w-full aspect-square object-cover rounded-lg border border-[#E1E1E1]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => deleteAsset(p.id)}
                                          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-[#EAEAEA]/90 border border-[#E1E1E1] text-[#161616] opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Ištrinti"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 font-['Outfit'] text-[12px] text-[#7C7C7C]">Pirmiausia nustatykite `value_text` (spalvos kodą).</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminStack>
  )
}
