import { defineField, defineType } from 'sanity'
import { slugify } from './utils/slugify'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleEn',
      title: 'Project Title (EN)',
      type: 'string',
      description: 'English version of the project title',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => slugify(input, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      titleEn: 'titleEn',
    },
    prepare({ title, titleEn }) {
      return {
        title,
        subtitle: titleEn ? `EN: ${titleEn}` : undefined,
      }
    },
  },
})
