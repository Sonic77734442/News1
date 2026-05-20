// pages/api/robots.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain')
  res.write(`User-agent: *
Allow: /

Disallow: /?attachment_id
Disallow: /?p=
Disallow: /?paged=
Disallow: /page/
Disallow: /home-
Disallow: /sample-page/
Disallow: /author/
Disallow: /tag/
Disallow: /category/uncategorized/
Disallow: /post-
Disallow: /blog-

Host: https://news1.kz
Sitemap: https://news1.kz/sitemap.xml
LLMS: https://news1.kz/llms.txt
LLMS-Full: https://news1.kz/llms-full.txt
`)
  res.end()
}

