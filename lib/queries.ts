// queries.ts

export const getAllSlugs = () => `
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current
  }
`;

export const articleBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    _updatedAt,
    dateModified,
    shortDescription,
    mainImage {
      asset -> { url }
    },
    body,
    "description": coalesce(description, shortDescription),
    author->{name},
    category->{title, slug}
  }
`;

export const categoryPostsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    category->slug.current == $categorySlug
  ]
  | order(publishedAt desc)
  [$start...$end] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> { url }
    },
    "description": coalesce(description, shortDescription),
    author->{name},
    category->{title, slug}
  }
`;

export const articlesByCategoryQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != $excludeSlug &&
    category->slug.current == $categorySlug
  ]
  | order(publishedAt desc)
  [$start...$end] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> { url }
    },
    body,
    "description": coalesce(description, shortDescription),
    author->{name},
    category->{title, slug}
  }
`;

export const getAllPostsForRss = () => `
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc)[0...20] {
    title,
    "slug": slug.current,
    _createdAt,
    "excerpt": pt::text(body)[0...150]
  }
`;

export const getLatestNewsForWidget = () => `
  *[_type == "post"] | order(_createdAt desc)[0...10] {
    _id,
    title,
    "slug": slug.current,
    "image": mainImage.asset->url
  }
`;
