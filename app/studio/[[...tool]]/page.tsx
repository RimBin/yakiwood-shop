'use client';

/**
 * Sanity Studio route
 * This renders the Sanity Studio at /studio
 */

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}

