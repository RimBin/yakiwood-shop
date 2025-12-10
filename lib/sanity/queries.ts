import { groq } from 'next-sanity'

export const PRODUCT_LIST_QUERY = groq`
  {
    "products": *[_type == "product" &&
      (!defined($category) || category == $category) &&
      (!defined($woodType) || woodType == $woodType) &&
      (!defined($search) || name match $search)
    ] | order(_createdAt desc)[$offset...$end] {
      _id,
      name,
      "slug": slug.current,
      basePrice,
      woodType,
      category,
      excerpt,
      heroImage->{
        _id,
        alt,
        image
      },
      gallery[]{
        _key,
        _type,
        ...,
        image
      }
    },
    "woodFilters": array::unique(*[_type == "product" && defined(woodType)].woodType),
    "categoryFilters": array::unique(*[_type == "product" && defined(category)].category)
  }
`
