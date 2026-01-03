import { defineType, defineField } from 'sanity';
import { slugify } from './utils/slugify';

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
        slugify: (input: string) => slugify(input, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'Rich text description with formatting, links, and lists',
    }),
    defineField({
      name: 'category',
      title: 'Usage Type',
      description: 'Primary customer choice – fasadas (cladding) or terasa (decking)',
      type: 'string',
      options: {
        list: [
          { title: 'Fasadams', value: 'facade' },
          { title: 'Terasoms', value: 'terrace' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'woodType',
      title: 'Wood Type',
      type: 'string',
      options: {
        list: [
          { title: 'Larch (Maumedis)', value: 'larch' },
          { title: 'Spruce (Eglė)', value: 'spruce' },
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
      name: 'colorVariants',
      title: 'Color Variants',
      description: 'All available burnt tones for this usage + wood combination',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'colorVariant',
          fields: [
            {
              name: 'name',
              title: 'Color Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'slug',
              title: 'Color Slug',
              type: 'slug',
              options: {
                source: 'name',
                maxLength: 64,
                slugify: (input: string) => slugify(input, 64),
              },
            },
            {
              name: 'hex',
              title: 'HEX value',
              type: 'string',
            },
            {
              name: 'image',
              title: 'Swatch / sample image',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'description',
              title: 'Short note',
              type: 'text',
            },
            {
              name: 'priceModifier',
              title: 'Price Modifier (EUR)',
              type: 'number',
              description: 'Additional price to add on top of base price when this color is selected',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'profiles',
      title: 'Profile Variants',
      description: 'Cross-section profiles (e.g. U15, Shadow, Deck board) available for this product',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'profileVariant',
          fields: [
            {
              name: 'name',
              title: 'Profile Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'code',
              title: 'Profile Code',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Profile Description',
              type: 'text',
            },
            {
              name: 'dimensions',
              title: 'Dimensions (mm)',
              type: 'object',
              fields: [
                { name: 'width', title: 'Width', type: 'number' },
                { name: 'thickness', title: 'Thickness', type: 'number' },
                { name: 'length', title: 'Length', type: 'number' },
              ],
            },
            {
              name: 'image',
              title: 'Profile Diagram',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'priceModifier',
              title: 'Price Modifier (EUR)',
              type: 'number',
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
      category: 'category',
      woodType: 'woodType',
      media: 'images.0',
    },
    prepare({ title, category, woodType, media }) {
      const usageLabel = category === 'facade' ? 'Fasadams' : category === 'terrace' ? 'Terasoms' : category;
      const woodTypeLabel = woodType === 'larch' ? 'Maumedis' : woodType === 'spruce' ? 'Eglė' : woodType;
      return {
        title,
        subtitle: [usageLabel, woodTypeLabel].filter(Boolean).join(' • '),
        media,
      };
    },
  },
});
