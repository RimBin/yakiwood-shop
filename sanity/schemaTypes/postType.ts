import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import { slugify } from './utils/slugify'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'titleEn',
      title: 'Title (EN)',
      type: 'string',
      description: 'English version of the post title',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => slugify(input, 96),
      },
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ]
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
    }),
    defineField({
      name: 'bodyEn',
      title: 'Body (EN)',
      type: 'blockContent',
      description: 'English version of the post body',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      titleEn: 'titleEn',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author, titleEn } = selection
      return {
        ...selection,
        subtitle: [author ? `by ${author}` : undefined, titleEn ? `EN: ${titleEn}` : undefined]
          .filter(Boolean)
          .join(' — '),
      }
    },
  },
})
