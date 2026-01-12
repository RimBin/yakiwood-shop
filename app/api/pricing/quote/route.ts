import { NextRequest, NextResponse } from 'next/server'
import { quoteConfigurationPricing, type UsageType, type InputMode, type AreaRoundingMode } from '@/lib/pricing/configuration'
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
  quantityBoards?: number
  inputMode?: InputMode
  targetAreaM2?: number
  rounding?: AreaRoundingMode
  cartTotalAreaM2?: number
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

    const inputMode: InputMode = body.inputMode === 'area' ? 'area' : 'boards'
    const quantityBoards = typeof body.quantityBoards === 'number' ? Number(body.quantityBoards) : NaN
    const targetAreaM2 = typeof body.targetAreaM2 === 'number' ? Number(body.targetAreaM2) : NaN

    if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm)) {
      return NextResponse.json({ error: 'Neteisingi matmenys' }, { status: 400 })
    }

    if (inputMode === 'boards' && !Number.isFinite(quantityBoards)) {
      return NextResponse.json({ error: 'Neteisingas kiekis' }, { status: 400 })
    }

    if (inputMode === 'area' && !Number.isFinite(targetAreaM2)) {
      return NextResponse.json({ error: 'Neteisingas plotas' }, { status: 400 })
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
      quantityBoards: inputMode === 'boards' ? quantityBoards : undefined,
      inputMode,
      targetAreaM2: inputMode === 'area' ? targetAreaM2 : undefined,
      rounding: body.rounding,
      cartTotalAreaM2: typeof body.cartTotalAreaM2 === 'number' ? body.cartTotalAreaM2 : undefined,
    })

    if (!quote) {
      return NextResponse.json({ error: 'Kaina nerasta šiai konfigūracijai' }, { status: 404 })
    }

    return NextResponse.json({
      unitPricePerM2: quote.unitPricePerM2,
      areaM2: quote.areaM2,
      totalAreaM2: quote.totalAreaM2,
      unitPricePerBoard: quote.unitPricePerBoard,
      quantityBoards: quote.quantityBoards,
      lineTotal: quote.lineTotal,
      inputMode: quote.inputMode,
      roundingInfo: quote.roundingInfo,
      resolvedBy: quote.resolvedBy,
    })
  } catch (e: any) {
    console.error('Pricing quote error', e)
    return NextResponse.json({ error: 'Nepavyko apskaičiuoti kainos' }, { status: 500 })
  }
}
