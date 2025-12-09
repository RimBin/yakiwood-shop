import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'inquiry',
  title: 'Užklausos',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Vardas',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'El. paštas',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Žinutė',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'product',
      title: 'Susijęs produktas',
      type: 'reference',
      to: [{ type: 'product' }],
    }),
    defineField({
      name: 'status',
      title: 'Statusas',
      type: 'string',
      options: {
        list: [
          { value: 'new', title: 'Nauja' },
          { value: 'reviewed', title: 'Peržiūrėta' },
          { value: 'closed', title: 'Uždaryta' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
  ],
  orderings: [
    {
      title: 'Naujausios',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})
