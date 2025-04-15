import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';
import { getAllSlugs } from '@/lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const slugs: { slug: string }[] = await sanity.fetch(getAllSlugs());

    // ✅ Логируем результат
    console.log('📄 Sitemap slugs:', slugs);

    const baseUrl = 'https://news1.kz';
    const staticPages = [
      '',
      '/category/finance',
      '/category/sport',
      '/category/it',
      '/category/kazakhstan',
    ];

    const urls = staticPages
      .map((path) => `<url><loc>${baseUrl}${path}</loc><changefreq>hourly</changefreq></url>`)
      .join('');

    const articleUrls = slugs
      .map(
        ({ slug }) =>
          `<url><loc>${baseUrl}/article/${slug}</loc><changefreq>daily</changefreq></url>`
      )
      .join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls +
      articleUrls +
      `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    res.status(500).send('Internal Server Error');
  }
}
