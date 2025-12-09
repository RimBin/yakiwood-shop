import imageUrlBuilder from '@sanity/image-url'
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { sanityClient } from './client'

const builder: ImageUrlBuilder | null = sanityClient ? imageUrlBuilder(sanityClient) : null

export function urlFor(source: SanityImageSource | undefined, width = 1200) {
  if (!builder || !source) return null
  return builder.image(source).width(width).format('webp').url()
}
