// queries.ts

export const getAllSlugs = () => `
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current
  }
`;

export const getArticleBySlug = (slug: string) => `
  *[_type == "post" && slug.current == "${slug}"][0]{
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> { url }
    },
    body,
    description,
    author->{name},
    category->{title, slug}
  }
`;

export const fetchCategoryPosts = (
  categorySlug: string,
  start: number,
  end: number
) => `
  *[
    _type == "post" &&
    defined(slug.current) &&
    category->slug.current == "${categorySlug}"
  ]
  | order(publishedAt desc)
  [${start}...${end}] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> { url }
    },
    body,
    description,
    author->{name},
    category->{title, slug}
  }
`;

// 🔄 Добавлено: запрос для бесконечной прокрутки на странице статьи
export const getArticlesByCategory = (
  categorySlug: string,
  excludeSlug: string,
  start: number,
  end: number
) => `
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != "${excludeSlug}" &&
    category->slug.current == "${categorySlug}"
  ]
  | order(publishedAt desc)
  [${start}...${end}] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> { url }
    },
    body,
    description,
    author->{name},
    category->{title, slug}
  }
`;



export const getAllPostsForRss = () => `
  *[_type == "article" && defined(slug.current)] | order(_createdAt desc)[0...20] {
    title,
    "slug": slug.current,
    _createdAt,
    "excerpt": pt::text(body)[0...150]
  }
`;
