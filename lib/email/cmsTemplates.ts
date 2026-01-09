import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'

export type EmailTemplateDoc = {
  _id: string
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

export async function getEmailTemplateDoc(templateId: string): Promise<EmailTemplateDoc | null> {
  if (!templateId || templateId.trim().length === 0) return null

  return await readClient.fetch<EmailTemplateDoc | null>(
    `*[_type == "emailTemplate" && templateId == $templateId][0]{_id,templateId,subjectLt,subjectEn,htmlLt,htmlEn}`,
    { templateId }
  )
}
