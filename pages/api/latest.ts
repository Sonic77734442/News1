// pages/api/latest.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = `
    *[_type == "post"] | order(publishedAt desc)[0...6] {
      _id, title, slug, publishedAt,
      "description": coalesce(description, shortDescription),
      mainImage { asset -> { url } },
      category -> { title, slug }
    }
  `;
  try {
    const posts = await sanity.fetch(query);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при загрузке новостей' });
  }
}
