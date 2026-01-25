import type { NextApiRequest, NextApiResponse } from 'next';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = process.env.TELEGRAM_CHANNEL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!BOT_TOKEN || !CHANNEL) {
    res.status(500).json({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL' });
    return;
  }

  const { title, slug, excerpt, token } = req.body || {};
  if (process.env.TELEGRAM_WEBHOOK_SECRET && token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!title || !slug) {
    res.status(400).json({ error: 'Missing title or slug' });
    return;
  }

  const url = `https://news1.kz/article/${slug}`;
  const text = `${title}\n\n${excerpt ? `${excerpt}\n\n` : ''}${url}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL,
        text,
        disable_web_page_preview: false,
      }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      res.status(502).json({ error: 'Telegram API error', details: errText });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post to Telegram' });
  }
}
