import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-03-01',
  useCdn: true,
})

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
      description,
      category -> {
        title,
        slug
      }
    }
  `

  return await sanity.fetch(query, { slug })
}
