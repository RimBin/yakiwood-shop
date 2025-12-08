import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 })
    }

    const body = (await request.json()) as EmailPayload
    if (!body.to || !body.subject || !body.html) {
      return NextResponse.json({ error: 'to, subject and html are required' }, { status: 400 })
    }

    const to = Array.isArray(body.to) ? body.to : [body.to]
    const cc = body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : undefined
    const bcc = body.bcc ? (Array.isArray(body.bcc) ? body.bcc : [body.bcc]) : undefined

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SYSTEM_EMAIL_FROM || 'Yakiwood <no-reply@yakiwood.local>',
        to,
        subject: body.subject,
        html: body.html,
        reply_to: body.replyTo,
        cc,
        bcc,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data?.error || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, to, status: 'queued' })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
