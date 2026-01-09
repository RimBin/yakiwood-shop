import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_TOKEN

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

export function assertWriteToken() {
  if (typeof token !== 'string' || token.trim().length === 0 || token === 'your-token-here') {
    throw new Error('SANITY_API_TOKEN is not configured')
  }
}
