// lib/queries.ts

export const getArticleBySlug = (slug: string) => `
  *[_type == "post" && slug.current == "${slug}"][0]{
    title,
    publishedAt,
    "author": author->{ name },
    "category": categories[0]->{ title },
    mainImage {
      asset->{ url }
    },
    body
  }
`;

export const getAllSlugs = () => `
  *[_type == "post" && defined(slug.current)].slug.current
`;
