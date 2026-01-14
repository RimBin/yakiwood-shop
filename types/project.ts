export type ProjectLocale = 'lt' | 'en';

export interface ProjectI18nFields {
  title: string;
  slug: string;
  location: string;
  subtitle?: string;
  description: string;
  fullDescription?: string;
}

export interface Project {
  id: string;
  /** Legacy/default slug (kept for backward compatibility). */
  slug: string;
  /** Legacy/default title (kept for backward compatibility). */
  title: string;
  /** Legacy/default subtitle (kept for backward compatibility). */
  subtitle?: string;
  /** Legacy/default location (kept for backward compatibility). */
  location: string;
  images: string[];
  featuredImage?: string;
  productsUsed: {
    name: string;
    slug: string;
  }[];
  /** Legacy/default description (kept for backward compatibility). */
  description: string;
  /** Legacy/default full description (kept for backward compatibility). */
  fullDescription?: string;
  /** Optional localized fields for LT/EN content and per-locale slugs. */
  i18n?: Partial<Record<ProjectLocale, Partial<ProjectI18nFields>>>;
  featured?: boolean;
  category?: string;
}

export interface RelatedProject {
  id: string;
  slug: string;
  title: string;
  location: string;
  image: string;
  size: 'small' | 'medium' | 'large';
}
