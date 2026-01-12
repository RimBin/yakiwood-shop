/**
 * SEO Metadata Validator
 * Validates metadata for SEO best practices
 */

export interface SEOValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface SEOValidationResult {
  isValid: boolean;
  issues: SEOValidationIssue[];
  score: number; // 0-100
}

export interface PageMetadata {
  url: string;
  title?: string;
  description?: string;
  openGraph?: {
    url?: string;
    title?: string;
    description?: string;
    images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
    type?: string;
    siteName?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
  keywords?: string[];
  canonical?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
}

// SEO Best Practice Limits
const LIMITS = {
  TITLE_MIN: 30,
  TITLE_MAX: 60,
  TITLE_IDEAL_MIN: 50,
  TITLE_IDEAL_MAX: 60,
  DESCRIPTION_MIN: 50,
  DESCRIPTION_MAX: 160,
  DESCRIPTION_IDEAL_MIN: 120,
  DESCRIPTION_IDEAL_MAX: 158,
  OG_TITLE_MAX: 95,
  OG_DESCRIPTION_MAX: 200,
  TWITTER_TITLE_MAX: 70,
  TWITTER_DESCRIPTION_MAX: 200,
  OG_IMAGE_MIN_WIDTH: 1200,
  OG_IMAGE_MIN_HEIGHT: 630,
  OG_IMAGE_IDEAL_WIDTH: 1200,
  OG_IMAGE_IDEAL_HEIGHT: 630,
};

/**
 * Validate page title
 */
export function validateTitle(title?: string): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];

  if (!title || title.trim() === '') {
    issues.push({
      field: 'title',
      severity: 'error',
      message: 'Title is missing - this is a critical SEO element',
    });
    return issues;
  }

  const length = title.length;

  if (length < LIMITS.TITLE_MIN) {
    issues.push({
      field: 'title',
      severity: 'warning',
      message: `Title too short (${length} chars). Recommended: ${LIMITS.TITLE_MIN}-${LIMITS.TITLE_MAX}`,
    });
  } else if (length > LIMITS.TITLE_MAX) {
    issues.push({
      field: 'title',
      severity: 'warning',
      message: `Title too long (${length} chars). Recommended: ${LIMITS.TITLE_MIN}-${LIMITS.TITLE_MAX}. Google may truncate.`,
    });
  } else if (length >= LIMITS.TITLE_IDEAL_MIN && length <= LIMITS.TITLE_IDEAL_MAX) {
    issues.push({
      field: 'title',
      severity: 'info',
      message: `Title optimal length (${length} chars) ✓`,
    });
  }

  // Check for duplicate words
  const words = title.toLowerCase().split(/\s+/);
  const duplicates = words.filter((word, index) => words.indexOf(word) !== index);
  if (duplicates.length > 0) {
    issues.push({
      field: 'title',
      severity: 'info',
      message: 'Title has duplicate words - consider optimizing',
    });
  }

  return issues;
}

/**
 * Validate meta description
 */
export function validateDescription(description?: string): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];

  if (!description || description.trim() === '') {
    issues.push({
      field: 'description',
      severity: 'error',
      message: 'Description is missing - this is a critical SEO element',
    });
    return issues;
  }

  const length = description.length;

  if (length < LIMITS.DESCRIPTION_MIN) {
    issues.push({
      field: 'description',
      severity: 'warning',
      message: `Description too short (${length} characters). Recommended: ${LIMITS.DESCRIPTION_MIN}-${LIMITS.DESCRIPTION_MAX}`,
    });
  } else if (length > LIMITS.DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      severity: 'warning',
      message: `Description too long (${length} characters). Recommended: ${LIMITS.DESCRIPTION_MIN}-${LIMITS.DESCRIPTION_MAX}. Google may truncate.`,
    });
  } else if (length >= LIMITS.DESCRIPTION_IDEAL_MIN && length <= LIMITS.DESCRIPTION_IDEAL_MAX) {
    issues.push({
      field: 'description',
      severity: 'info',
      message: `Description optimal length (${length} characters) ✓`,
    });
  }

  return issues;
}

/**
 * Validate Open Graph metadata
 */
export function validateOpenGraph(
  og?: PageMetadata['openGraph'],
  baseTitle?: string,
  baseDescription?: string
): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];

  if (!og) {
    issues.push({
      field: 'openGraph',
      severity: 'warning',
      message: 'Open Graph metadata missing - required for social media',
    });
    return issues;
  }

  // Title
  const ogTitle = og.title || baseTitle;
  if (!ogTitle) {
    issues.push({
      field: 'openGraph.title',
      severity: 'error',
      message: 'Open Graph title missing',
    });
  } else if (ogTitle.length > LIMITS.OG_TITLE_MAX) {
    issues.push({
      field: 'openGraph.title',
      severity: 'warning',
      message: `OG title too long (${ogTitle.length} characters). Max: ${LIMITS.OG_TITLE_MAX}`,
    });
  }

  // Description
  const ogDesc = og.description || baseDescription;
  if (!ogDesc) {
    issues.push({
      field: 'openGraph.description',
      severity: 'error',
      message: 'Open Graph description missing',
    });
  } else if (ogDesc.length > LIMITS.OG_DESCRIPTION_MAX) {
    issues.push({
      field: 'openGraph.description',
      severity: 'warning',
      message: `OG description too long (${ogDesc.length} characters). Max: ${LIMITS.OG_DESCRIPTION_MAX}`,
    });
  }

  // Images
  if (!og.images || og.images.length === 0) {
    issues.push({
      field: 'openGraph.images',
      severity: 'warning',
      message: 'Open Graph image missing - recommended for social sharing',
    });
  } else {
    const image = og.images[0];
    if (image.width && image.width < LIMITS.OG_IMAGE_MIN_WIDTH) {
      issues.push({
        field: 'openGraph.images',
        severity: 'warning',
        message: `OG image too narrow (${image.width}px). Recommended: ${LIMITS.OG_IMAGE_IDEAL_WIDTH}x${LIMITS.OG_IMAGE_IDEAL_HEIGHT}`,
      });
    }
    if (image.height && image.height < LIMITS.OG_IMAGE_MIN_HEIGHT) {
      issues.push({
        field: 'openGraph.images',
        severity: 'warning',
        message: `OG image too short (${image.height}px). Recommended: ${LIMITS.OG_IMAGE_IDEAL_WIDTH}x${LIMITS.OG_IMAGE_IDEAL_HEIGHT}`,
      });
    }
    if (!image.alt) {
      issues.push({
        field: 'openGraph.images',
        severity: 'info',
        message: 'OG image missing alt text - recommended for accessibility',
      });
    }
  }

  // Type
  if (!og.type) {
    issues.push({
      field: 'openGraph.type',
      severity: 'info',
      message: 'OG type not set - default will be "website"',
    });
  }

  return issues;
}

/**
 * Validate Twitter Card metadata
 */
export function validateTwitter(
  twitter?: PageMetadata['twitter'],
  baseTitle?: string,
  baseDescription?: string
): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];

  if (!twitter) {
    issues.push({
      field: 'twitter',
      severity: 'info',
      message: 'Twitter Card metadata missing - will use OG as fallback',
    });
    return issues;
  }

  // Card type
  if (!twitter.card) {
    issues.push({
      field: 'twitter.card',
      severity: 'warning',
      message: 'Twitter card type not set',
    });
  } else if (!['summary', 'summary_large_image', 'app', 'player'].includes(twitter.card)) {
    issues.push({
      field: 'twitter.card',
      severity: 'warning',
      message: `Unknown Twitter card type: ${twitter.card}`,
    });
  }

  // Title
  const twitterTitle = twitter.title || baseTitle;
  if (twitterTitle && twitterTitle.length > LIMITS.TWITTER_TITLE_MAX) {
    issues.push({
      field: 'twitter.title',
      severity: 'warning',
      message: `Twitter title too long (${twitterTitle.length} characters). Max: ${LIMITS.TWITTER_TITLE_MAX}`,
    });
  }

  // Description
  const twitterDesc = twitter.description || baseDescription;
  if (twitterDesc && twitterDesc.length > LIMITS.TWITTER_DESCRIPTION_MAX) {
    issues.push({
      field: 'twitter.description',
      severity: 'warning',
      message: `Twitter description too long (${twitterDesc.length} characters). Max: ${LIMITS.TWITTER_DESCRIPTION_MAX}`,
    });
  }

  return issues;
}

/**
 * Validate canonical URL
 */
export function validateCanonical(canonical?: string, currentUrl?: string): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];

  if (!canonical) {
    issues.push({
      field: 'canonical',
      severity: 'warning',
      message: 'Canonical URL missing - recommended for duplicate prevention',
    });
    return issues;
  }

  // Check if valid URL
  try {
    new URL(canonical);
  } catch (e) {
    issues.push({
      field: 'canonical',
      severity: 'error',
      message: `Invalid canonical URL format: ${canonical}`,
    });
    return issues;
  }

  // Check if HTTPS
  if (!canonical.startsWith('https://')) {
    issues.push({
      field: 'canonical',
      severity: 'warning',
      message: 'Canonical URL should use HTTPS',
    });
  }

  return issues;
}

/**
 * Calculate SEO score (0-100)
 */
export function calculateSEOScore(issues: SEOValidationIssue[]): number {
  let score = 100;

  issues.forEach((issue) => {
    switch (issue.severity) {
      case 'error':
        score -= 20;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        // Info doesn't reduce score
        break;
    }
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Main validation function
 */
export function validatePageMetadata(metadata: PageMetadata): SEOValidationResult {
  const issues: SEOValidationIssue[] = [];

  // Validate core metadata
  issues.push(...validateTitle(metadata.title));
  issues.push(...validateDescription(metadata.description));
  issues.push(...validateOpenGraph(metadata.openGraph, metadata.title, metadata.description));
  issues.push(...validateTwitter(metadata.twitter, metadata.title, metadata.description));
  issues.push(...validateCanonical(metadata.canonical, metadata.url));

  // Validate robots
  if (!metadata.robots) {
    issues.push({
      field: 'robots',
      severity: 'info',
      message: 'Robots meta tag nenustatytas - default bus index,follow',
    });
  } else {
    if (metadata.robots.index === false) {
      issues.push({
        field: 'robots',
        severity: 'warning',
        message: 'Puslapis nustatytas neindeksuoti (noindex)',
      });
    }
    if (metadata.robots.follow === false) {
      issues.push({
        field: 'robots',
        severity: 'warning',
        message: 'Nuorodos puslapyje nebebus sekamos (nofollow)',
      });
    }
  }

  const score = calculateSEOScore(issues);
  const errorCount = issues.filter((i) => i.severity === 'error').length;

  return {
    isValid: errorCount === 0,
    issues,
    score,
  };
}

/**
 * Get score color class for Tailwind
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get score badge color for Tailwind
 */
export function getScoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}
