import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'mediaAsset',
  title: 'Nuotraukos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Pavadinimas',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Failas',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'alt',
      title: 'Alt tekstas',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Žymos',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})
