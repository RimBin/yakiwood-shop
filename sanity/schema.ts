import { type SchemaTypeDefinition } from 'sanity'
import product from './schemas/product'
import mediaAsset from './schemas/mediaAsset'
import siteCopy from './schemas/siteCopy'
import inquiry from './schemas/inquiry'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, mediaAsset, siteCopy, inquiry],
}
