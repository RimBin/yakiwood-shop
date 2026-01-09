import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'
import { assertWriteToken, writeClient } from '@/sanity/lib/writeClient'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

type EmailTemplateDoc = {
  _id: string
  _type: 'emailTemplate'
  templateId: string
  subjectLt?: string
  subjectEn?: string
  htmlLt?: string
  htmlEn?: string
}

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const templateId = request.nextUrl.searchParams.get('templateId')
    if (!templateId || templateId.trim().length === 0) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const doc = await readClient.fetch<EmailTemplateDoc | null>(
      `*[_type == "emailTemplate" && templateId == $templateId][0]{_id,_type,templateId,subjectLt,subjectEn,htmlLt,htmlEn}`,
      { templateId }
    )

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
    assertWriteToken()

    const body = (await request.json()) as Partial<
      Pick<EmailTemplateDoc, 'templateId' | 'subjectLt' | 'subjectEn' | 'htmlLt' | 'htmlEn'>
    >

    const templateId = typeof body.templateId === 'string' ? body.templateId.trim() : ''
    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    const _id = `emailTemplate.${templateId}`

    await writeClient.createIfNotExists({
      _id,
      _type: 'emailTemplate',
      templateId,
    })

    const updated = await writeClient
      .patch(_id)
      .set({
        templateId,
        subjectLt: body.subjectLt ?? '',
        subjectEn: body.subjectEn ?? '',
        htmlLt: body.htmlLt ?? '',
        htmlEn: body.htmlEn ?? '',
      })
      .commit({ autoGenerateArrayKeys: true })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (typeof error?.message === 'string' && error.message.includes('SANITY_API_TOKEN')) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
