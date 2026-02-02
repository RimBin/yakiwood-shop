import 'server-only'

import { supabaseAdmin } from '@/lib/supabase-admin'

export type EmailTemplateDoc = {
  templateId: string
  subjectLt?: string
  subjectEn?: string
  htmlLt?: string
  htmlEn?: string
}

export async function getEmailTemplateDoc(templateId: string): Promise<EmailTemplateDoc | null> {
  if (!templateId || templateId.trim().length === 0) return null

  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('template_id,subject_lt,subject_en,html_lt,html_en')
    .eq('template_id', templateId)
    .maybeSingle()

  if (error || !data) return null

  return {
    templateId: data.template_id,
    subjectLt: data.subject_lt || undefined,
    subjectEn: data.subject_en || undefined,
    htmlLt: data.html_lt || undefined,
    htmlEn: data.html_en || undefined,
  }
}
