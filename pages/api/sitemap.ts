import type { NextApiRequest, NextApiResponse } from 'next'
import { sanity } from '@/lib/sanity'
import { getAllSlugs } from '@/lib/queries'

const baseUrl = 'https://news1.kz'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const posts: { slug: string; _updatedAt?: string }[] = await sanity.fetch(
      `*[_type == "post"]{ "slug": slug.current, _updatedAt }`
    )

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts
  .map(({ slug, _updatedAt }) => {
    const lastmod = _updatedAt ? `<lastmod>${new Date(_updatedAt).toISOString()}</lastmod>` : ''
    return `<url>
  <loc>${baseUrl}/article/${slug}</loc>
  ${lastmod}
  <changefreq>daily</changefreq>
  <priority>1.0</priority>
</url>`
  })
  .join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(sitemap)
  } catch (error) {
    console.error('Ошибка генерации sitemap:', error)
    res.status(500).send('Internal Server Error')
  }
}
