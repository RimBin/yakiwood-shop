import { defineField, defineType } from 'sanity'

export const emailTemplateType = defineType({
  name: 'emailTemplate',
  title: 'Email Template',
  type: 'document',
  fields: [
    defineField({
      name: 'templateId',
      title: 'Template ID',
      type: 'string',
      description: 'Must match a template id from the app (e.g. order-confirmation)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subjectLt',
      title: 'Subject (LT)',
      type: 'string',
    }),
    defineField({
      name: 'subjectEn',
      title: 'Subject (EN)',
      type: 'string',
    }),
    defineField({
      name: 'htmlLt',
      title: 'HTML (LT)',
      type: 'text',
      rows: 20,
    }),
    defineField({
      name: 'htmlEn',
      title: 'HTML (EN)',
      type: 'text',
      rows: 20,
    }),
  ],
  preview: {
    select: {
      title: 'templateId',
      subtitle: 'subjectLt',
    },
  },
})
