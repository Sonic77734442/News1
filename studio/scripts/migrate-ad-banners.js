const { createClient } = require('@sanity/client');

const projectId = process.env.SANITY_PROJECT_ID || '8kp3qa75';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('Missing SANITY_API_TOKEN');
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
  const banners = await client.fetch(
    '*[_type == "adBanner"]{_id, enabled, position, frequency, title, type}'
  );

  if (!banners.length) {
    console.log('No adBanner documents found.');
    return;
  }

  const tx = client.transaction();
  let patched = 0;

  for (const banner of banners) {
    const setFields = {};
    if (banner.enabled === undefined) setFields.enabled = true;
    if (!banner.position) setFields.position = 'sidebar';

    if (Object.keys(setFields).length > 0) {
      tx.patch(banner._id, { set: setFields });
      patched += 1;
    }
  }

  if (patched === 0) {
    console.log('No documents needed updates.');
    return;
  }

  await tx.commit();
  console.log(`Updated ${patched} adBanner document(s).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
