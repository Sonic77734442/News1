import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: '8kp3qa75',
  dataset: 'production',
  apiVersion: '2023-03-01',
  useCdn: true,
});

export async function fetchCategoryPosts(slug: string, start = 0, end = 6) {
  const query = `
    *[_type == "post" && category->slug.current == $slug]
    | order(publishedAt desc)[${start}...${end}] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage {
        asset -> {
          url
        }
      },
      "description": coalesce(description, shortDescription),
      category -> {
        title,
        slug
      }
    }
  `;

  return await sanity.fetch(query, { slug });
}

export async function fetchAllPosts(start = 0, end = 6) {
  const query = `
    *[_type == "post" && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[${start}...${end}] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage {
        asset -> {
          url
        }
      },
      "description": coalesce(description, shortDescription),
      category -> {
        title,
        slug
      }
    }
  `;

  return await sanity.fetch(query);
}
