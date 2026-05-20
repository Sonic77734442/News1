import Parser from 'rss-parser';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID || '8kp3qa75';
const token = process.env.SANITY_API_TOKEN;
const trendGeo = process.env.TRENDS_GEO || 'KZ';
const defaultAuthorName = process.env.AUTO_CONTENT_AUTHOR_NAME || 'News1.kz';
const dryRun = process.env.DRY_RUN === '1';
const maxItems = Number(process.env.TRENDS_MAX_ITEMS || 5);

const autoPublish = process.env.AUTO_PUBLISH === '1';
const autoPushSocial = process.env.AUTO_PUSH_SOCIAL === '1';

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const pexelsApiKey = process.env.PEXELS_API_KEY;
const siteUrl = (process.env.SITE_URL || 'https://news1.kz').replace(/\/$/, '');

function normalizeDataset(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

  if (!cleaned) return 'production';

  const valid = /^~?[a-z0-9_-]{1,64}$/.test(cleaned);
  if (!valid) {
    throw new Error(
      `Invalid SANITY_DATASET="${cleaned}". Expected values like "production" (lowercase, digits, "_" or "-").`
    );
  }

  return cleaned;
}

const dataset = normalizeDataset(process.env.SANITY_DATASET);

if (!token) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}

const parser = new Parser();
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-03-01',
  token,
  useCdn: false,
});

const trendsUrl = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(trendGeo)}`;

const categoryKeywordHints = {
  finance: ['тенге', 'доллар', 'инфляц', 'ставк', 'банк', 'рынок', 'нефт', 'налог', 'ипотек', 'эконом', 'бюджет'],
  sport: ['матч', 'чемпион', 'футбол', 'хоккей', 'бокс', 'спорт', 'турнир', 'гол', 'лига', 'уефа'],
  sports: ['матч', 'чемпион', 'футбол', 'хоккей', 'бокс', 'спорт', 'турнир', 'гол', 'лига', 'уефа'],
  it: ['ai', 'ии', 'техно', 'apple', 'google', 'microsoft', 'openai', 'смартфон', 'кибер', 'стартап'],
  technology: ['ai', 'ии', 'техно', 'apple', 'google', 'microsoft', 'openai', 'смартфон', 'кибер', 'стартап'],
  kazakhstan: ['казахстан', 'астана', 'алматы', 'правительство', 'акимат', 'мажилис', 'рк'],
  world: ['мир', 'международ', 'оон', 'ес', 'сша', 'китай', 'россия', 'европа'],
  politics: ['президент', 'парламент', 'выборы', 'министр', 'закон', 'реформа'],
};

function transliterate(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
    ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
  };

  return value
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('');
}

function toBaseSlug(title) {
  const base = transliterate(title)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70);

  return base || `trend-${Date.now()}`;
}

async function getCategories() {
  const categories = await client.fetch(
    '*[_type == "category" && defined(slug.current)]{ _id, title, "slug": slug.current }'
  );
  return Array.isArray(categories) ? categories.filter((x) => x?._id && x?.slug) : [];
}

function rankCategoriesByKeywords(text, categories) {
  const hay = (text || '').toLowerCase();
  if (!hay || !categories.length) return null;

  let best = null;
  let bestScore = -1;

  for (const category of categories) {
    const slug = String(category.slug || '').toLowerCase();
    const title = String(category.title || '').toLowerCase();
    const hints = categoryKeywordHints[slug] || [];

    let score = 0;
    if (slug && hay.includes(slug)) score += 2;
    if (title && hay.includes(title)) score += 2;

    for (const kw of hints) {
      if (hay.includes(kw)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return bestScore > 0 ? best : null;
}

async function pickCategory(categories, topic, generated) {
  if (!categories.length) return null;

  const combinedText = [topic, generated?.title, generated?.shortDescription, ...(generated?.paragraphs || [])]
    .filter(Boolean)
    .join(' ');

  const byKeywords = rankCategoriesByKeywords(combinedText, categories);
  if (byKeywords?._id) return byKeywords;

  if (!openAiApiKey) return categories[0];

  const categoryList = categories.map((c) => ({ slug: c.slug, title: c.title }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiModel,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'Ты классификатор новостей. Выбери только один slug категории из списка. Верни только slug, без пояснений.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            topic,
            title: generated?.title,
            shortDescription: generated?.shortDescription,
            categories: categoryList,
          }),
        },
      ],
    }),
  });

  if (!response.ok) return categories[0];
  const data = await response.json();
  const pickedSlug = String(data?.choices?.[0]?.message?.content || '').trim().toLowerCase();
  const exact = categories.find((c) => String(c.slug).toLowerCase() === pickedSlug);
  if (exact) return exact;

  return categories[0];
}

function fallbackDraft(topic) {
  const title = `${topic}: что важно знать сегодня`;
  const shortDescription = `Краткий разбор темы «${topic}»: подтвержденные факты, контекст и последствия.`;
  const paragraphs = [
    `Тема «${topic}» активно обсуждается в информационной повестке и поисковых трендах.`,
    'Сейчас важно отделять подтвержденные факты от непроверенных заявлений и следить за официальными источниками.',
    'Редакционный подход: фиксировать новые данные, давать контекст и объяснять влияние новости на аудиторию.',
    'Материал будет обновляться по мере появления новых подтверждений и комментариев профильных сторон.',
  ];

  return {
    title,
    shortDescription,
    paragraphs,
    imageQuery: topic,
  };
}

function extractJson(content) {
  if (!content) return null;
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

async function generateUniqueArticle(topic, sourceHint = '') {
  if (!openAiApiKey) {
    return fallbackDraft(topic);
  }

  const system = [
    'Ты редактор новостей Казахстана.',
    'Пиши уникально, без копипаста, на русском языке.',
    'Не выдумывай факты: если фактов мало, так и укажи нейтрально.',
    'Верни только JSON без лишнего текста.',
  ].join(' ');

  const user = {
    task: 'Сгенерируй черновик новости по теме тренда.',
    topic,
    sourceHint,
    outputSchema: {
      title: 'string, до 90 символов',
      shortDescription: 'string, 140-220 символов',
      paragraphs: 'array из 4 строк по 2-4 предложения каждая',
      imageQuery: 'string, 2-5 слов для поиска фото (english preferred)',
    },
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiModel,
      temperature: 0.9,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(user) },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.warn(`OpenAI failed (${response.status}): ${details}`);
    return fallbackDraft(topic);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const jsonText = extractJson(content);

  if (!jsonText) {
    console.warn('OpenAI response did not include JSON. Using fallback template.');
    return fallbackDraft(topic);
  }

  try {
    const parsed = JSON.parse(jsonText);
    const title = String(parsed?.title || '').trim();
    const shortDescription = String(parsed?.shortDescription || '').trim();
    const paragraphs = Array.isArray(parsed?.paragraphs)
      ? parsed.paragraphs.map((x) => String(x || '').trim()).filter(Boolean)
      : [];
    const imageQuery = String(parsed?.imageQuery || '').trim();

    if (!title || !shortDescription || paragraphs.length < 2) {
      return fallbackDraft(topic);
    }

    return {
      title: title.slice(0, 120),
      shortDescription: shortDescription.slice(0, 260),
      paragraphs: paragraphs.slice(0, 6),
      imageQuery: imageQuery || topic,
    };
  } catch (error) {
    console.warn('Failed to parse OpenAI JSON. Using fallback template.');
    return fallbackDraft(topic);
  }
}

function makeBodyBlocks(paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
  }));
}

async function getAnyCategoryRef() {
  return client.fetch('*[_type == "category"][0]{ _id }');
}

async function getOrCreateAuthor() {
  const byName = await client.fetch('*[_type == "author" && name == $name][0]{ _id, name }', {
    name: defaultAuthorName,
  });
  if (byName?._id) return byName._id;

  const created = await client.create({
    _type: 'author',
    name: defaultAuthorName,
  });

  return created._id;
}

async function slugExists(slug) {
  const doc = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id }', { slug });
  return Boolean(doc?._id);
}

async function buildUniqueSlug(baseSlug) {
  for (let i = 0; i < 30; i += 1) {
    const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await slugExists(candidate);
    if (!exists) return candidate;
  }

  return `${baseSlug}-${Date.now()}`;
}

async function fetchPexelsImage(query) {
  if (!pexelsApiKey) return null;

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const response = await fetch(url, {
    headers: {
      Authorization: pexelsApiKey,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    console.warn(`Pexels failed (${response.status}): ${details}`);
    return null;
  }

  const data = await response.json();
  const photo = data?.photos?.[0];
  if (!photo?.src) return null;

  return {
    imageUrl: photo.src.large2x || photo.src.large || photo.src.original,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
  };
}

async function uploadImageAsset(imageUrl, slug) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      const details = await response.text();
      console.warn(`Image download failed (${response.status}): ${details}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    const asset = await client.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType,
    });

    return asset?._id || null;
  } catch (error) {
    console.warn(`Image upload failed: ${error?.message || error}`);
    return null;
  }
}

async function postToTelegram({ title, slug, excerpt }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL;

  if (!botToken || !channel) return { skipped: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL' };

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const articleUrl = `${siteUrl}/article/${slug}`;
  const text = `${title}\n\n${excerpt ? `${excerpt}\n\n` : ''}${articleUrl}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channel,
      text,
      disable_web_page_preview: false,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram API failed (${response.status}): ${details}`);
  }

  return { success: true };
}

async function postToFacebook({ title, slug, excerpt }) {
  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_TOKEN;

  if (!pageId || !pageToken) return { skipped: 'Missing FB_PAGE_ID or FB_PAGE_TOKEN' };

  const link = `${siteUrl}/article/${slug}`;

  const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: excerpt ? `${title}\n\n${excerpt}` : title,
      link,
      access_token: pageToken,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Facebook API failed (${response.status}): ${details}`);
  }

  return { success: true };
}

async function pushSocial(payload) {
  const results = [];

  try {
    const tg = await postToTelegram(payload);
    results.push({ platform: 'telegram', ...tg });
  } catch (error) {
    results.push({ platform: 'telegram', error: error?.message || String(error) });
  }

  try {
    const fb = await postToFacebook(payload);
    results.push({ platform: 'facebook', ...fb });
  } catch (error) {
    results.push({ platform: 'facebook', error: error?.message || String(error) });
  }

  return results;
}

async function run() {
  console.log(`Fetching trends from: ${trendsUrl}`);
  const feed = await parser.parseURL(trendsUrl);
  const items = (feed.items || []).slice(0, Math.max(1, maxItems));

  if (!items.length) {
    console.log('No trend items found.');
    return;
  }

  const authorId = await getOrCreateAuthor();
  const categories = await getCategories();
  const fallbackCategoryRef = categories[0] || (await getAnyCategoryRef());

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const topic = (item.title || '').trim();
    if (!topic) {
      skippedCount += 1;
      continue;
    }

    const baseSlug = toBaseSlug(topic);
    // eslint-disable-next-line no-await-in-loop
    const slug = await buildUniqueSlug(baseSlug);

    const sourceHint = [item.contentSnippet, item.content, item.link].filter(Boolean).join(' | ');
    // eslint-disable-next-line no-await-in-loop
    const generated = await generateUniqueArticle(topic, sourceHint);

    // eslint-disable-next-line no-await-in-loop
    const pickedCategory = await pickCategory(categories, topic, generated);

    const safeTitle = generated.title || `${topic}: что важно знать сегодня`;
    const safeDescription = generated.shortDescription || `Разбор темы «${topic}».`;
    const paragraphs = generated.paragraphs?.length ? generated.paragraphs : fallbackDraft(topic).paragraphs;

    let imageAssetRef;
    const imageQuery = generated.imageQuery || topic;
    // eslint-disable-next-line no-await-in-loop
    const pexelsImage = await fetchPexelsImage(imageQuery);

    if (pexelsImage?.imageUrl && !dryRun) {
      // eslint-disable-next-line no-await-in-loop
      const assetId = await uploadImageAsset(pexelsImage.imageUrl, slug);
      if (assetId) {
        imageAssetRef = {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        };
      }
    }

    const docId = autoPublish ? crypto.randomUUID() : `drafts.${crypto.randomUUID()}`;

    const postDoc = {
      _id: docId,
      _type: 'post',
      title: safeTitle,
      slug: { _type: 'slug', current: slug },
      author: { _type: 'reference', _ref: authorId },
      category: (pickedCategory?._id || fallbackCategoryRef?._id)
        ? { _type: 'reference', _ref: pickedCategory?._id || fallbackCategoryRef?._id }
        : undefined,
      publishedAt: new Date().toISOString(),
      shortDescription: safeDescription,
      featured: false,
      body: makeBodyBlocks(paragraphs),
      mainImage: imageAssetRef,
    };

    if (dryRun) {
      console.log(`[DRY_RUN] Would create ${autoPublish ? 'published' : 'draft'} post: ${safeTitle}`);
      createdCount += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await client.create(postDoc);
    console.log(`Created ${autoPublish ? 'published' : 'draft'} post: ${safeTitle}`);

    if (autoPublish && autoPushSocial) {
      // eslint-disable-next-line no-await-in-loop
      const pushResults = await pushSocial({
        title: safeTitle,
        slug,
        excerpt: safeDescription,
      });

      console.log(`Social push: ${JSON.stringify(pushResults)}`);
    }

    createdCount += 1;
  }

  console.log(`Done. Created: ${createdCount}, skipped: ${skippedCount}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
