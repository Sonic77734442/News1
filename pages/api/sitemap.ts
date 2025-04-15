import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';
import { getAllSlugs } from '@/lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🟢 Sitemap handler triggered');

  try {
    const baseUrl = 'https://news1.kz';

    const staticPages = [
      '',
      '/category/finance',
      '/category/sport',
      '/category/it',
      '/category/kazakhstan',
    ];

    // 🧱 Запрашиваем статьи из Sanity
    let slugs: { slug?: string }[] = [];
    try {
      const sanityData = await sanity.fetch(getAllSlugs());
      slugs = Array.isArray(sanityData) ? sanityData : [];
    } catch (err) {
      console.warn('⚠️ Sanity fetch failed:', err);
    }

    const staticUrls = staticPages.map(
      (path) =>
        `<url><loc>${baseUrl}${path}</loc><changefreq>hourly</changefreq></url>`
    );

    const articleUrls = slugs
      .filter((item) => typeof item?.slug === 'string')
      .map(
        (item) =>
          `<url><loc>${baseUrl}/article/${item.slug}</loc><changefreq>daily</changefreq></url>`
      );

    const sitemapParts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls,
      ...articleUrls,
      '</urlset>',
    ];

    const sitemap = sitemapParts.join('\n');

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://news1.kz/</loc><changefreq>hourly</changefreq></url>
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(fallback);
  }
}
