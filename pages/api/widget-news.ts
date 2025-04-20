import type { NextApiRequest, NextApiResponse } from 'next'
import { sanity } from '@/lib/sanity'
import { getLatestNewsForWidget } from '@/lib/queries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await sanity.fetch(getLatestNewsForWidget())
    const news = data.map((item: any) => ({
      title: item.title,
      url: `https://news1.kz/article/${item.slug}`,
      image: item.image,
    }))
    res.status(200).json(news)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки новостей' })
  }
}
