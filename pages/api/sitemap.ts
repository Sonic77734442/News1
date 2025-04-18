// pages/api/sitemap.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = 'https://news1.kz';

  const postQuery = `
    *[_type == "post"]{
      slug,
      _updatedAt
    }
  `;

  const categoryQuery = `
    *[_type == "category"]{
      slug,
      _updatedAt
    }
  `;

  const [posts, categories] = await Promise.all([
    sanity.fetch(postQuery),
    sanity.fetch(categoryQuery)
  ]);

  const staticRoutes = [
    { url: '', updated: new Date().toISOString() },
  ];

  const postRoutes = posts.map((post: any) => ({
    url: `article/${post.slug.current}`,
    updated: post._updatedAt,
  }));

  const categoryRoutes = categories.map((cat: any) => ({
    url: `category/${cat.slug.current}`,
    updated: cat._updatedAt,
  }));

  const allRoutes = [...staticRoutes, ...postRoutes, ...categoryRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allRoutes
        .map(
          ({ url, updated }) => `
        <url>
          <loc>${baseUrl}/${url}</loc>
          <lastmod>${new Date(updated).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>${url === '' ? '1.0' : '0.8'}</priority>
        </url>`
        )
        .join('')}
    </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).end(sitemap);
}
