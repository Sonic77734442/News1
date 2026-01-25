import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const icon = Array.isArray(req.query.icon) ? req.query.icon[0] : req.query.icon;
  if (!icon || typeof icon !== 'string') {
    res.status(400).send('Missing icon');
    return;
  }

  const url = `https://openweathermap.org/img/wn/${encodeURIComponent(icon)}.png`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).send('Bad gateway');
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).send('Error fetching icon');
  }
}
