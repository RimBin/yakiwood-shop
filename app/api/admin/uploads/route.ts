import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin'

const DEFAULT_BUCKET = 'product-images'

function sanitizeFileName(fileName: string) {
  const [name, ...rest] = fileName.split('.')
  const ext = rest.pop()
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${safeName || 'file'}${ext ? `.${ext}` : ''}`
}

async function ensureBucket(supabase: SupabaseClient, bucket: string) {
  const { data } = await supabase.storage.getBucket(bucket)
  if (!data) {
    await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: '20MB',
      allowedMimeTypes: ['image/*'],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await request.json()
    const fileName = typeof body.fileName === 'string' ? body.fileName : ''
    const contentType = typeof body.contentType === 'string' ? body.contentType : ''
    const bucket = body.bucket || process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 })
    }

    await ensureBucket(supabase, bucket)

    const sanitized = sanitizeFileName(fileName)
    const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${sanitized}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: true })

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Unable to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      path,
      bucket,
      uploadUrl: data.signedUrl,
      token: data.token,
      publicUrl: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
    })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
