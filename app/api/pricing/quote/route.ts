import { NextRequest, NextResponse } from 'next/server'
import { quoteConfigurationPricing, type UsageType } from '@/lib/pricing/configuration'
import { supabaseAdmin } from '@/lib/supabase-admin'

type QuoteBody = {
  productId: string
  usageType?: UsageType
  profileVariantId?: string
  colorVariantId?: string
  thicknessOptionId?: string
  thicknessMm?: number
  widthMm: number
  lengthMm: number
  quantityBoards: number
}

async function resolveThicknessOptionIdFromMm(thicknessMm: number): Promise<string | null> {
  if (!supabaseAdmin) return null
  if (!Number.isFinite(thicknessMm) || thicknessMm <= 0) return null

  const { data, error } = await supabaseAdmin
    .from('catalog_options')
    .select('id')
    .eq('option_type', 'thickness')
    .eq('value_mm', Math.round(thicknessMm))
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null
  return typeof (data as any).id === 'string' ? (data as any).id : null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteBody

    const productId = String(body.productId || '').trim()
    if (!productId) {
      return NextResponse.json({ error: 'Trūksta produkto ID' }, { status: 400 })
    }

    const widthMm = Number(body.widthMm)
    const lengthMm = Number(body.lengthMm)
    const quantityBoards = Number(body.quantityBoards)

    if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm) || !Number.isFinite(quantityBoards)) {
      return NextResponse.json({ error: 'Neteisingi matmenys arba kiekis' }, { status: 400 })
    }

    const thicknessOptionIdFromMm =
      typeof body.thicknessMm === 'number'
        ? await resolveThicknessOptionIdFromMm(body.thicknessMm)
        : null

    const quote = await quoteConfigurationPricing({
      productId,
      usageType: body.usageType,
      profileVariantId: body.profileVariantId,
      colorVariantId: body.colorVariantId,
      thicknessOptionId:
        typeof body.thicknessOptionId === 'string' && body.thicknessOptionId.trim()
          ? body.thicknessOptionId
          : thicknessOptionIdFromMm ?? undefined,
      widthMm,
      lengthMm,
      quantityBoards,
    })

    if (!quote) {
      return NextResponse.json({ error: 'Kaina nerasta šiai konfigūracijai' }, { status: 404 })
    }

    return NextResponse.json({
      unitPricePerM2: quote.unitPricePerM2,
      areaM2: quote.areaM2,
      unitPricePerBoard: quote.unitPricePerBoard,
      quantityBoards: quote.quantityBoards,
      lineTotal: quote.lineTotal,
      resolvedBy: quote.resolvedBy,
    })
  } catch (e: any) {
    console.error('Pricing quote error', e)
    return NextResponse.json({ error: 'Nepavyko apskaičiuoti kainos' }, { status: 500 })
  }
}
