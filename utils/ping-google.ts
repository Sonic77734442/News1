// utils/ping-google.ts

export async function pingSearchEngines() {
  const sitemapUrl = 'https://news1.kz/sitemap.xml';

  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://yandex.ru/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
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
