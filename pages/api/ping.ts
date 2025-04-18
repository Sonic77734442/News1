// pages/api/ping.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { pingSearchEngines } from '@/utils/ping-google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await pingSearchEngines();
    res.status(200).json({ success: true, message: 'Sitemap pinged successfully' });
  } catch (error) {
    console.error('Ping error:', error);
    res.status(500).json({ success: false, message: 'Failed to ping sitemap', error });
  }
}
