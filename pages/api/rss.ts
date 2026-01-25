// pages/api/rss.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { sanity } from '@/lib/sanity';
import { getAllPostsForRss } from '@/lib/queries';
import { format } from 'date-fns';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const posts = await sanity.fetch(getAllPostsForRss());

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>News1.kz</title>
      <link>https://news1.kz</link>
      <description>Свежие новости Казахстана</description>
      ${posts
        .map(
          (post: any) => `
        <item>
          <title>${post.title}</title>
          <link>https://news1.kz/article/${post.slug}</link>
          <pubDate>${format(new Date(post._createdAt), 'EEE, dd MMM yyyy HH:mm:ss xx')}</pubDate>
          <description>${post.excerpt || ''}</description>
        </item>`
        )
        .join('')}
    </channel>
  </rss>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(rss);
  res.end();
};

export default handler;
