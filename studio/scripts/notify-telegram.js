const { createClient } = require('@sanity/client');

const projectId = process.env.SANITY_PROJECT_ID || '8kp3qa75';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;
const webhook = process.env.SITE_TELEGRAM_WEBHOOK;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}
if (!webhook) {
  console.error('Missing SITE_TELEGRAM_WEBHOOK');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-03-01',
  token,
  useCdn: false,
});

async function run() {
  const posts = await client.fetch(
    '*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...5] {title, "slug": slug.current, "excerpt": coalesce(description, shortDescription)}'
  );

  for (const post of posts) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        token: webhookSecret,
      }),
    });
    console.log('Sent:', post.slug);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
