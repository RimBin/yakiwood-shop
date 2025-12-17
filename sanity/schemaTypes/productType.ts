import { defineType, defineField } from 'sanity';

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Facades', value: 'facades' },
          { title: 'Terraces', value: 'terraces' },
          { title: 'Fences', value: 'fences' },
          { title: 'Interiors', value: 'interiors' },
          { title: 'Furniture', value: 'furniture' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'basePrice',
      title: 'Base Price (EUR)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'finishes',
      title: 'Available Finishes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Finish Name',
              type: 'string',
            },
            {
              name: 'colorCode',
              title: 'Color Code (hex)',
              type: 'string',
            },
            {
              name: 'image',
              title: 'Finish Image',
              type: 'image',
            },
            {
              name: 'priceModifier',
              title: 'Price Modifier (EUR)',
              type: 'number',
              description: 'Additional cost for this finish',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'object',
      fields: [
        {
          name: 'width',
          title: 'Width (mm)',
          type: 'number',
        },
        {
          name: 'length',
          title: 'Length (mm)',
          type: 'number',
        },
        {
          name: 'thickness',
          title: 'Thickness (mm)',
          type: 'number',
        },
      ],
    }),
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Display this product on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'images.0',
    },
  },
});
