import {defineField, defineType} from 'sanity'

export const chatbotFaqEntryType = defineType({
  name: 'chatbotFaqEntry',
  title: 'Chatbot FAQ Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      initialValue: 'lt',
      options: {
        list: [
          {title: 'Lithuanian (lt)', value: 'lt'},
          {title: 'English (en)', value: 'en'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in matching and admin lists.',
      initialValue: 100,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(200),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required().min(3).max(4000),
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      description: 'Used for matching. Add synonyms and common phrases.',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'suggestions',
      title: 'Suggestions',
      description: 'Optional quick prompts returned by the API (future use).',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {
      question: 'question',
      locale: 'locale',
      enabled: 'enabled',
      order: 'order',
    },
    prepare({question, locale, enabled, order}) {
      const status = enabled ? 'enabled' : 'disabled'
      return {
        title: question,
        subtitle: `${locale} • ${status} • order ${order ?? '—'}`,
      }
    },
  },
})
