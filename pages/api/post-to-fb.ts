import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.body || {};
  const body = raw.body || raw;
  const title = body?.title;
  const slug =
    typeof body?.slug === 'string' ? body.slug : body?.slug?.current;

  if (!title || !slug) {
    return res.status(400).json({
      error: 'Invalid payload. Expected {title, slug} or {body:{title, slug:{current}}}',
    });
  }
  const link = `https://news1.kz/article/${slug}`;

  const FB_PAGE_ID = process.env.FB_PAGE_ID;
  const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
    return res.status(500).json({ error: 'Missing Facebook credentials' });
  }

  try {
    await axios.post(`https://graph.facebook.com/v18.0/${FB_PAGE_ID}/feed`, {
      message: `${title}\n\nЧитать полностью: ${link}`,
      access_token: FB_PAGE_TOKEN,
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Ошибка Facebook API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to post to Facebook' });
  }
}
