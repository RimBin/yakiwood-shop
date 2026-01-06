import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_TOKEN
const shouldUseToken =
  typeof token === 'string' &&
  token.trim().length > 0 &&
  token !== 'your-token-here' &&
  !token.includes('placeholder')

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  ...(shouldUseToken ? { token } : {}), // Only send token when it's actually configured
})
