// utils/ping-search-engines.ts

export async function pingSearchEngines() {
  const sitemapUrl = 'https://news1.kz/sitemap.xml';

  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://yandex.ru/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  ];

  for (const url of targets) {
    try {
      const res = await fetch(url);
      console.log(`Pinged: ${url} | Status: ${res.status}`);
    } catch (err) {
      console.error(`Ошибка при пинге ${url}:`, err);
    }
  }
}

// API endpoint for webhook
// pages/api/ping.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await pingSearchEngines();
    res.status(200).json({ success: true, message: 'Sitemap pinged successfully' });
  } catch (error) {
    console.error('Ping error:', error);
    res.status(500).json({ success: false, message: 'Failed to ping sitemap', error });
  }
}
