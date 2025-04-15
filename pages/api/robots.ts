import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const robots = `
User-agent: *
Disallow:

Sitemap: https://news1.kz/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robots);
  res.end();
}
