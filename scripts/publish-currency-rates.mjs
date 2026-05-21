import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID || '8kp3qa75';
const token = process.env.SANITY_API_TOKEN;
const autoPublish = process.env.AUTO_PUBLISH !== '0';
const dryRun = process.env.DRY_RUN === '1';
const defaultAuthorName = process.env.AUTO_CONTENT_AUTHOR_NAME || 'News1.kz';
const currencyCategorySlugHint = String(process.env.CURRENCY_CATEGORY_SLUG || 'finance').toLowerCase();
const sourceUrls = String(
  process.env.CURRENCY_RATES_URLS ||
    'https://nationalbank.kz/rss/rates_all.xml,https://www.nationalbank.kz/rss/rates_all.xml'
)
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

if (!token) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}

function normalizeDataset(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

  if (!cleaned) return 'production';
  if (!/^~?[a-z0-9_-]{1,64}$/.test(cleaned)) {
    throw new Error(`Invalid SANITY_DATASET="${cleaned}"`);
  }
  return cleaned;
}

const dataset = normalizeDataset(process.env.SANITY_DATASET);
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-03-01',
  token,
  useCdn: false,
});

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function decodeXmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = String(block || '').match(regex);
  return match?.[1] ? decodeXmlEntities(match[1]) : '';
}

function parseDmyToIso(value) {
  const m = String(value || '').match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const month = m[2].padStart(2, '0');
  const fullYear = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${fullYear}-${month}-${day}`;
}

function getKzDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const pick = (type) => parts.find((p) => p.type === type)?.value || '';
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');

  return {
    iso: `${year}-${month}-${day}`,
    dmy: `${day}.${month}.${year}`,
  };
}

function parseRatesXml(xmlText) {
  const xml = String(xmlText || '');
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const rows = [];

  for (const match of itemMatches) {
    const block = match[1] || '';
    const codeRaw = normalizeWhitespace(extractTag(block, 'title')).toUpperCase();
    const codeMatch = codeRaw.match(/[A-Z]{3}/);
    const code = codeMatch?.[0] || '';
    const rateRaw = normalizeWhitespace(extractTag(block, 'description')).replace(',', '.');
    const quantRaw = normalizeWhitespace(extractTag(block, 'quant'));
    const pubDate = normalizeWhitespace(extractTag(block, 'pubDate'));

    const rate = Number(rateRaw);
    const quant = Number(quantRaw) || 1;
    if (!code || !Number.isFinite(rate) || rate <= 0) continue;

    rows.push({
      code,
      rate,
      quant,
      perUnitRate: rate / quant,
      pubDate,
    });
  }

  return rows;
}

async function fetchRates() {
  let lastError = null;

  for (const rawUrl of sourceUrls) {
    const url = rawUrl.includes('{{DATE_DMY}}') ? rawUrl.replace('{{DATE_DMY}}', getKzDateParts().dmy) : rawUrl;
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(url, { headers: { 'User-Agent': 'News1CurrencyBot/1.0' } });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      // eslint-disable-next-line no-await-in-loop
      const xmlText = await response.text();
      const rows = parseRatesXml(xmlText);
      if (rows.length > 0) {
        return { rows, sourceUrl: url };
      }
      throw new Error('No rate rows found');
    } catch (error) {
      lastError = `${url}: ${error?.message || error}`;
      console.warn(`Rates source failed: ${lastError}`);
    }
  }

  throw new Error(`Failed to fetch rates from all sources. Last error: ${lastError || 'unknown'}`);
}

function makeBodyBlocks(paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text: normalizeWhitespace(text), marks: [] }],
  }));
}

function pickMainRates(rows) {
  const wanted = ['USD', 'EUR', 'RUB', 'CNY', 'GBP'];
  const byCode = new Map();
  for (const row of rows) {
    if (!byCode.has(row.code)) byCode.set(row.code, row);
  }
  return wanted.map((code) => byCode.get(code)).filter(Boolean);
}

function formatRate(value) {
  const maxFrac = value < 1 ? 4 : 2;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFrac,
  }).format(value);
}

async function getCategories() {
  const categories = await client.fetch(
    '*[_type == "category" && defined(slug.current)]{ _id, title, "slug": slug.current }'
  );
  return Array.isArray(categories) ? categories : [];
}

function pickFinanceCategory(categories) {
  const slug = currencyCategorySlugHint;
  const direct = categories.find((x) => String(x?.slug || '').toLowerCase() === slug);
  if (direct?._id) return direct;

  const byPattern = categories.find((x) =>
    /(fin|finance|finans|econom|business|biz|ekonom)/i.test(String(x?.slug || ''))
  );
  if (byPattern?._id) return byPattern;

  return categories[0] || null;
}

async function getOrCreateAuthor() {
  const byName = await client.fetch('*[_type == "author" && name == $name][0]{ _id }', { name: defaultAuthorName });
  if (byName?._id) return byName._id;

  const author = await client.create({ _type: 'author', name: defaultAuthorName });
  return author._id;
}

async function postExistsBySlug(slug) {
  const existing = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title }', { slug });
  return existing || null;
}

async function run() {
  const { rows, sourceUrl } = await fetchRates();
  const mainRates = pickMainRates(rows);
  if (!mainRates.length) {
    throw new Error('No target currencies found (USD/EUR/RUB/CNY/GBP)');
  }

  const sourceDateIso = parseDmyToIso(mainRates.find((x) => x.pubDate)?.pubDate || '');
  const kzDate = getKzDateParts();
  const publishDateIso = sourceDateIso || kzDate.iso;
  const displayDate = `${publishDateIso.slice(8, 10)}.${publishDateIso.slice(5, 7)}.${publishDateIso.slice(0, 4)}`;
  const slug = `kursy-valyut-v-kazakhstane-na-${publishDateIso}`;
  const nowIso = new Date().toISOString();

  const usd = mainRates.find((x) => x.code === 'USD');
  const eur = mainRates.find((x) => x.code === 'EUR');
  const rub = mainRates.find((x) => x.code === 'RUB');
  const headlineParts = [`Курс валют в Казахстане на ${displayDate}`];
  if (usd) headlineParts.push(`доллар ${formatRate(usd.perUnitRate)} ₸`);
  const title = headlineParts.join(': ');

  const shortDescription = [
    usd ? `USD — ${formatRate(usd.perUnitRate)} ₸` : '',
    eur ? `EUR — ${formatRate(eur.perUnitRate)} ₸` : '',
    rub ? `RUB — ${formatRate(rub.perUnitRate)} ₸` : '',
    `официальные данные НБРК на ${displayDate}`,
  ]
    .filter(Boolean)
    .join(', ');

  const lines = mainRates.map((row) => {
    const unitLabel = row.quant > 1 ? `за ${row.quant} ${row.code}` : `за 1 ${row.code}`;
    return `${row.code}: ${formatRate(row.rate)} ₸ ${unitLabel} (${formatRate(row.perUnitRate)} ₸ за единицу).`;
  });

  const paragraphs = [
    `Национальный Банк Казахстана опубликовал официальные курсы валют на ${displayDate}.`,
    `Ключевые значения: ${lines.slice(0, 3).join(' ')}`,
    lines.length > 3 ? `Дополнительно: ${lines.slice(3).join(' ')}` : '',
    `Источник: ${sourceUrl}.`,
  ].filter(Boolean);

  const existing = await postExistsBySlug(slug);
  if (existing?._id) {
    console.log(`Skip: currency post already exists (${slug})`);
    return;
  }

  const authorId = await getOrCreateAuthor();
  const categories = await getCategories();
  const financeCategory = pickFinanceCategory(categories);

  const postDoc = {
    _id: autoPublish ? crypto.randomUUID() : `drafts.${crypto.randomUUID()}`,
    _type: 'post',
    title: title.slice(0, 120),
    slug: { _type: 'slug', current: slug },
    author: { _type: 'reference', _ref: authorId },
    category: financeCategory?._id ? { _type: 'reference', _ref: financeCategory._id } : undefined,
    publishedAt: nowIso,
    dateModified: nowIso,
    shortDescription: shortDescription.slice(0, 260),
    featured: false,
    body: makeBodyBlocks(paragraphs),
  };

  if (dryRun) {
    console.log(`[DRY_RUN] Would create ${autoPublish ? 'published' : 'draft'} currency post: ${postDoc.title}`);
    return;
  }

  await client.create(postDoc);
  console.log(`Created ${autoPublish ? 'published' : 'draft'} currency post: ${postDoc.title}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
