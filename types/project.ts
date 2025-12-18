export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  images: string[];
  featuredImage?: string;
  productsUsed: {
    name: string;
    slug: string;
  }[];
  description: string;
  fullDescription?: string;
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
