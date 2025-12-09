import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteCopy',
  title: 'Svetainės tekstai',
  type: 'document',
  fields: [
    defineField({ name: 'heroTitle', title: 'Hero antraštė', type: 'string' }),
    defineField({ name: 'heroSubtitle', title: 'Hero tekstas', type: 'text' }),
    defineField({
      name: 'aboutParagraphs',
      title: 'Apie tekstai',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'faq',
      title: 'DUK',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Klausimas', type: 'string' }),
            defineField({ name: 'answer', title: 'Atsakymas', type: 'text' }),
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Svetainės tekstai' }) },
})
