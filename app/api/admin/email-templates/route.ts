import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

type EmailTemplateDoc = {
  template_id: string
  subject_lt?: string | null
  subject_en?: string | null
  html_lt?: string | null
  html_en?: string | null
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const templateId = request.nextUrl.searchParams.get('templateId')
    if (!templateId || templateId.trim().length === 0) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('template_id,subject_lt,subject_en,html_lt,html_en')
      .eq('template_id', templateId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
    }

    const doc = data
      ? {
          templateId: data.template_id,
          subjectLt: data.subject_lt || '',
          subjectEn: data.subject_en || '',
          htmlLt: data.html_lt || '',
          htmlEn: data.html_en || '',
        }
      : null

    return NextResponse.json({ success: true, data: doc })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = (await request.json()) as Partial<
      Pick<EmailTemplateDoc, 'templateId' | 'subjectLt' | 'subjectEn' | 'htmlLt' | 'htmlEn'>
    >

    const templateId = typeof body.templateId === 'string' ? body.templateId.trim() : ''
    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .upsert(
        {
          template_id: templateId,
          subject_lt: body.subjectLt ?? '',
          subject_en: body.subjectEn ?? '',
          html_lt: body.htmlLt ?? '',
          html_en: body.htmlEn ?? '',
        },
        { onConflict: 'template_id' }
      )
      .select('template_id,subject_lt,subject_en,html_lt,html_en')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        templateId: data.template_id,
        subjectLt: data.subject_lt || '',
        subjectEn: data.subject_en || '',
        htmlLt: data.html_lt || '',
        htmlEn: data.html_en || '',
      },
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
