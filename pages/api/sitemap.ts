import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';
import { getAllSlugs } from '@/lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slugs: { slug: string }[] = await sanity.fetch(getAllSlugs());

  const baseUrl = 'https://news1.kz';
  const staticPages = [
    '',
    '/category/finance',
    '/category/sport',
    '/category/it',
    '/category/kazakhstan',
  ];

  const urls = staticPages.map(
    (path) => `<url><loc>${baseUrl}${path}</loc><changefreq>hourly</changefreq></url>`
  );

  const articleUrls = slugs.map(
    ({ slug }) =>
      `<url><loc>${baseUrl}/article/${slug}</loc><changefreq>daily</changefreq></url>`
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
    ${articleUrls.join('\n')}
  </urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();
}
