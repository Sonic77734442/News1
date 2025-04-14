import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: '8kp3qa75',               // 🔒 Хардкодим ID
  dataset: 'production',              // 🔒 Только строчные буквы!
  apiVersion: '2023-03-01',           // 🔒 Формат YYYY-MM-DD
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
console.log('DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET)
