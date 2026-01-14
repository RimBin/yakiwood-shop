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
    defineField({
      name: 'slugEn',
      title: 'Slug (EN)',
      type: 'slug',
      description: 'English slug used for English routes',
      options: {
        source: 'titleEn',
        maxLength: 96,
        slugify: (input: string) => slugify(input, 96),
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      titleEn: 'titleEn',
      slug: 'slug.current',
      slugEn: 'slugEn.current',
    },
    prepare({ title, titleEn, slug, slugEn }) {
      return {
        title,
        subtitle: [
          titleEn ? `EN: ${titleEn}` : undefined,
          slug ? `LT slug: ${slug}` : undefined,
          slugEn ? `EN slug: ${slugEn}` : undefined,
        ]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
