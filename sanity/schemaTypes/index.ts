import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {productType} from './productType'
import {projectType} from './projectType'
import {emailTemplateType} from './emailTemplateType'
import {chatbotFaqEntryType} from './chatbotFaqEntryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    productType,
    projectType,
    emailTemplateType,
    chatbotFaqEntryType,
  ],
}

// Named export for sanity.config.ts
export const schemaTypes = schema.types;
