import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produktai',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Pavadinimas',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'basePrice',
      title: 'Kaina (EUR)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'woodType',
      title: 'Mediena',
      type: 'string',
      options: {
        list: [
          { value: 'spruce', title: 'Eglė' },
          { value: 'larch', title: 'Maumedis' },
          { value: 'oak', title: 'Ąžuolas' },
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Kategorija',
      type: 'string',
      options: {
        list: [
          { value: 'cladding', title: 'Fasadai' },
          { value: 'decking', title: 'Terasos' },
          { value: 'furniture', title: 'Baldai' },
        ],
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Trumpas tekstas',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'description',
      title: 'Aprašymas',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero nuotrauka',
      type: 'reference',
      to: [{ type: 'mediaAsset' }],
    }),
    defineField({
      name: 'gallery',
      title: 'Galerija',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'mediaAsset' }] }],
    }),
    defineField({
      name: 'variants',
      title: 'Variantai',
      type: 'array',
      of: [
        {
          name: 'productVariant',
          title: 'Variantas',
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Pavadinimas', type: 'string' }),
            defineField({
              name: 'variantType',
              title: 'Tipas',
              type: 'string',
              options: { list: ['color', 'finish'] },
            }),
            defineField({ name: 'hexColor', title: 'HEX', type: 'string' }),
            defineField({ name: 'priceAdjustment', title: 'Kainos korekcija', type: 'number' }),
          ],
        },
      ],
    }),
  ],
})
