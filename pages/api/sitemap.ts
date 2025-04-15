import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity'; // ✅ Убедись, что путь правильный
import { getAllSlugs } from '@/lib/queries'; // ✅ и этот тоже

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🟢 Sitemap handler triggered');

  try {
    const slugs: { slug: string }[] = await sanity.fetch(getAllSlugs());

    console.log('📄 Sitemap slugs (REAL):', slugs);

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
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    res.status(500).send('Internal Server Error');
  }
}
