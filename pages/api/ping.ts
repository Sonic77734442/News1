// pages/api/ping.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { pingSearchEngines } from '@/utils/ping-google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const webhookSecret = process.env.PING_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ success: false, message: 'Missing PING_WEBHOOK_SECRET' });
  }

  const token = req.body?.token;
  if (token !== webhookSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await pingSearchEngines();
    return res.status(200).json({ success: true, message: 'Sitemap pinged successfully' });
  } catch (error) {
    console.error('Ping error:', error);
    return res.status(500).json({ success: false, message: 'Failed to ping sitemap' });
  }
}
