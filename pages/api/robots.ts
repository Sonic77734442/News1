// pages/api/robots.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain');
  res.write(`User-agent: *
Allow: /

Host: https://news1.kz
Sitemap: https://news1.kz/sitemap.xml
`);
  res.end();
}
