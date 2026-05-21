import Parser from 'rss-parser';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID || '8kp3qa75';
const token = process.env.SANITY_API_TOKEN;
const defaultAuthorName = process.env.AUTO_CONTENT_AUTHOR_NAME || 'News1.kz';
const dryRun = process.env.DRY_RUN === '1';
const dedupLookbackDays = Number(process.env.DEDUP_LOOKBACK_DAYS || 21);
const dedupMinSimilarity = Number(process.env.DEDUP_MIN_SIMILARITY || 0.82);
const minFactSignals = Number(process.env.MIN_FACT_SIGNALS || 2);
const enableFactCheck = process.env.ENABLE_FACT_CHECK !== '0';
const minBodyChars = Number(process.env.MIN_BODY_CHARS || 900);
const DEFAULT_GOOGLE_NEWS_RSS_URLS =
  'https://news.google.com/rss/search?q=Казахстан&hl=ru&gl=KZ&ceid=KZ:ru,https://news.google.com/rss/search?q=Казахстан+финансы&hl=ru&gl=KZ&ceid=KZ:ru,https://news.google.com/rss/search?q=Казахстан+спорт&hl=ru&gl=KZ&ceid=KZ:ru,https://news.google.com/rss/search?q=Казахстан+технологии&hl=ru&gl=KZ&ceid=KZ:ru';
const DEFAULT_EXTRA_NEWS_RSS_URLS =
  'https://www.inform.kz/rss/p_ru.rss,https://www.inform.kz/rss/ru.xml,https://nationalbank.kz/rss_news_russian.xml';

function splitCsvList(input) {
  return String(input || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

const googleNewsRssUrls = splitCsvList(process.env.GOOGLE_NEWS_RSS_URLS || DEFAULT_GOOGLE_NEWS_RSS_URLS);
const extraNewsRssUrls = splitCsvList(process.env.EXTRA_NEWS_RSS_URLS || DEFAULT_EXTRA_NEWS_RSS_URLS);
const googleNewsMaxItems = Number(process.env.GOOGLE_NEWS_MAX_ITEMS || 8);
const extraNewsMaxItems = Number(process.env.EXTRA_NEWS_MAX_ITEMS || 6);
const pipelineMaxItems = Number(process.env.NEWS_MAX_ITEMS || googleNewsMaxItems || 8);
const minRelevanceScore = Number(process.env.MIN_RELEVANCE_SCORE || 2);

function toSafeUrl(rawUrl) {
  const input = String(rawUrl || '').trim();
  if (!input) return '';

  try {
    const url = new URL(input);
    const q = url.searchParams.get('q');
    if (q) {
      url.searchParams.set('q', q);
    }
    return url.toString();
  } catch {
    return encodeURI(input);
  }
}

const autoPublish = process.env.AUTO_PUBLISH === '1';
const autoPushSocial = process.env.AUTO_PUSH_SOCIAL === '1';

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const pexelsApiKey = process.env.PEXELS_API_KEY;
const siteUrl = (process.env.SITE_URL || 'https://news1.kz').replace(/\/$/, '');
const fallbackImageUrl = process.env.FALLBACK_IMAGE_URL || `${siteUrl}/default-preview.png`;
const nowIsoDate = new Date().toISOString().slice(0, 10);
const currentYear = String(new Date().getUTCFullYear());

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

const NEWS1_EDITOR_PROMPT = `
Ты — профессиональный редактор современного digital-СМИ News1.kz.
Создавай уникальные новости на основе актуальных инфоповодов и новостных источников.

Правила:
- Пиши как живой журналист, без копипаста и без шаблонов агрегатора.
- Сохраняй факты и суть, глубоко перерабатывай формулировки.
- Допускается объединение нескольких источников, но только с подтверждаемыми фактами.
- Избегай воды, канцелярита и AI-клише.
- Стиль уровня: Tengrinews, Forbes Kazakhstan, РБК, VC.ru.
- Короткие абзацы, читаемая структура, динамичная подача.

SEO:
- Естественные ключевые слова.
- Цепляющий SEO-friendly заголовок.
- Краткий лид и фактическая подача без оценочных выводов.
- Без keyword stuffing.
`;

const BANNED_PHRASES = ['в современном мире', 'следует отметить', 'как известно', 'данная ситуация'];

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

  return base || `news-${Date.now()}`;
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
  const title = `${topic}: главное`;
  const shortDescription = `Подборка подтвержденных фактов по теме «${topic}».`;
  const paragraphs = [
    `По теме «${topic}» в открытых источниках фиксируется повышенный интерес.`,
    'На момент публикации подтверждены базовые сведения из открытых источников.',
    'Дополнительные детали сверяются по первичным публикациям и официальным сообщениям.',
    'В тексте оставлены только проверяемые факты без оценочных интерпретаций.',
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

function extractYears(text) {
  const matches = String(text || '').match(/\b20\d{2}\b/g) || [];
  return new Set(matches);
}

function stripUntrustedYears(text, allowedYears) {
  return String(text || '').replace(/\b20\d{2}\b/g, (year) => (allowedYears.has(year) ? year : ''));
}

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cleanFeedText(text) {
  const withoutTags = String(text || '').replace(/<[^>]*>/g, ' ');
  const decoded = decodeHtmlEntities(withoutTags);
  const withoutUrls = decoded.replace(/https?:\/\/\S+/gi, ' ');
  return normalizeWhitespace(withoutUrls);
}

function stripSourceSuffix(title) {
  const clean = normalizeWhitespace(title);
  if (!clean) return '';
  const parts = clean.split(/\s+[—-]\s+/);
  if (parts.length <= 1) return clean;
  return parts[0].trim();
}

function hasKzSignal(text) {
  const hay = normalizeForDedup(text);
  const keywords = [
    'kazakhstan',
    'qazaqstan',
    'tokayev',
    'astana',
    'almaty',
    'tenge',
    'kzt',
    'kaz',
    'казахстан',
    'токаев',
    'астана',
    'алматы',
    'тенге',
    'мажилис',
    'акимат',
  ];
  return keywords.some((x) => hay.includes(normalizeForDedup(x)));
}

function relevanceScoreForItem(item) {
  const title = String(item?.title || '');
  const snippet = String(item?.contentSnippet || '');
  const link = String(item?.link || '');
  const sourceType = String(item?.sourceType || 'news');
  const text = `${title} ${snippet}`;
  let score = 0;

  if (hasKzSignal(text)) score += 2;
  if (/\.kz(\/|$)|[?&]gl=KZ\b/i.test(link)) score += 1;
  if (sourceType === 'trusted_rss') score += 1;

  const foreignNoise = /(казани|псковск|латви|эстони|dw\.com|mail\.ru|финам|себежск)/i.test(text);
  if (foreignNoise && !hasKzSignal(text)) score -= 2;

  return score;
}

function toEventKey(text) {
  const stop = new Set([
    'news',
    'online',
    'novosti',
    'kz',
    'com',
    'ru',
    'org',
    'net',
    'the',
    'and',
    'что',
    'это',
    'для',
    'как',
    'при',
    'про',
    'над',
    'под',
    'или',
    'новости',
  ]);

  const tokens = normalizeForDedup(stripSourceSuffix(text))
    .split(' ')
    .filter((t) => t.length > 2 && !stop.has(t))
    .slice(0, 8);

  return tokens.join('-');
}

function trimToSentenceBoundary(text, maxLength) {
  const clean = normalizeWhitespace(text);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength);
  const lastPunctuation = Math.max(sliced.lastIndexOf('.'), sliced.lastIndexOf('!'), sliced.lastIndexOf('?'));
  if (lastPunctuation > 80) return sliced.slice(0, lastPunctuation + 1).trim();
  return `${sliced.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function normalizeSeoTitle(title, topic) {
  const raw = normalizeWhitespace(title || `${topic}: главное`);
  return trimToSentenceBoundary(raw, 78);
}

function normalizeSeoDescription(description, paragraphs, topic) {
  const base = normalizeWhitespace(description || '');
  if (base) return trimToSentenceBoundary(base, 170);

  const paragraphFallback = normalizeWhitespace((paragraphs || []).join(' '));
  if (paragraphFallback) return trimToSentenceBoundary(paragraphFallback, 170);

  return trimToSentenceBoundary(`Подборка подтвержденных фактов по теме «${topic}».`, 170);
}

function stripBannedPhrases(text) {
  let out = String(text || '');
  for (const phrase of BANNED_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), '');
  }
  return normalizeWhitespace(out);
}

function countFactSignals(text) {
  const input = String(text || '');
  if (!input) return 0;
  const numbers = input.match(/\b\d+(?:[.,]\d+)?\b/g) || [];
  const percents = input.match(/\b\d+(?:[.,]\d+)?\s?%/g) || [];
  const currency = input.match(/\b(?:₸|\$|€)\s?\d+|\b\d+\s?(?:тг|тенге|доллар(?:ов)?|евро)\b/gi) || [];
  const dates = input.match(/\b\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?\b/g) || [];
  const years = input.match(/\b20\d{2}\b/g) || [];
  const properNames = input.match(/\b[А-ЯЁ][а-яё]{2,}\b/g) || [];

  return (
    numbers.length +
    percents.length +
    currency.length +
    dates.length +
    years.length +
    Math.min(3, properNames.length)
  );
}

function countWaterPhrases(text) {
  const hay = String(text || '').toLowerCase();
  const waterPatterns = [
    'активно обсуждается',
    'важно отметить',
    'в контексте',
    'следует подчеркнуть',
    'по мнению экспертов',
    'ситуация остается',
    'может повлиять',
    'в ближайшее время',
  ];
  return waterPatterns.reduce((sum, phrase) => sum + (hay.includes(phrase) ? 1 : 0), 0);
}

function draftLooksWatery(draft) {
  const allText = [draft?.title, draft?.shortDescription, ...(draft?.paragraphs || [])].join(' ');
  const factSignals = countFactSignals(allText);
  const waterSignals = countWaterPhrases(allText);
  return factSignals < minFactSignals || waterSignals > factSignals + 1;
}

function extractFactSnippetsFromSource(sourceHint) {
  const source = cleanFeedText(sourceHint);
  if (!source) return [];

  const chunks = source
    .split(/[\n|]+/)
    .flatMap((part) => part.split(/(?<=[.!?])\s+/))
    .map((x) => normalizeWhitespace(x))
    .filter(Boolean);

  const scored = chunks
    .map((text) => {
      const score = countFactSignals(text);
      return { text, score };
    })
    .filter((x) => x.score > 0)
    .filter((x) => !/^use only confirmed facts from these news materials/i.test(x.text))
    .filter((x) => !/^source context\s*:/i.test(x.text))
    .filter((x) => !/^facts from related items\s*:/i.test(x.text))
    .filter((x) => !/^(rule|source_type|news_source|news_facts|source_domain|source_published_at)\s*:/i.test(x.text))
    .filter((x) => !/news\.google\.com|href=|rss\/articles/i.test(x.text))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => trimToSentenceBoundary(x.text, 150));
}

function hasRequiredStructure(paragraphs) {
  const items = Array.isArray(paragraphs) ? paragraphs : [];
  if (items.length < 2) return false;
  const joined = items.join(' ');
  const factSignals = countFactSignals(joined);
  const hasUncertaintyMarker = /данные уточняются|детали пока ограничены/i.test(joined);
  if (countWaterPhrases(joined) > 4) return false;
  return factSignals >= 1 || hasUncertaintyMarker;
}

function sanitizeLegacyTemplatePhrases(paragraphs) {
  const cleaned = (Array.isArray(paragraphs) ? paragraphs : [])
    .map((p) => normalizeWhitespace(p))
    .filter(Boolean)
    .map((p) => p.replace(/^source context\s*:\s*/i, ''))
    .map((p) => p.replace(/^facts from related items\s*:\s*/i, ''))
    .map((p) => p.replace(/^use only confirmed facts from these news materials\.?\s*/i, ''))
    .map((p) => p.replace(/факты на сейчас:\s*/gi, ''))
    .map((p) => p.replace(/что делать читателю сейчас:\s*/gi, ''))
    .map((p) => p.replace(/редакция проверяет официальные публикации[^.]*\./gi, ''))
    .map((p) => p.replace(/материал обновляется по мере поступления проверяемых данных[^.]*\./gi, ''))
    .map((p) => p.replace(/^\d\)\s*/i, ''))
    .filter(Boolean)
    .map((p) => p.replace(/\s{2,}/g, ' ').trim())
    .map((p) => stripBannedPhrases(p));

  const unique = [];
  const seen = new Set();
  for (const paragraph of cleaned) {
    const key = normalizeForDedup(paragraph);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(paragraph);
  }

  return unique;
}

function containsLegacyTemplatePhrases(paragraphs, shortDescription = '') {
  const all = [shortDescription, ...(Array.isArray(paragraphs) ? paragraphs : [])].join(' ').toLowerCase();
  return (
    all.includes('source context:') ||
    all.includes('facts from related items:') ||
    all.includes('факты на сейчас') ||
    all.includes('что делать читателю сейчас') ||
    all.includes('редакция проверяет официальные публикации') ||
    all.includes('материал обновляется по мере поступления проверяемых данных')
  );
}

function bodyChars(paragraphs) {
  return (Array.isArray(paragraphs) ? paragraphs : []).join(' ').trim().length;
}

function hasSufficientLength(paragraphs) {
  const chars = bodyChars(paragraphs);
  const minChars = Number.isFinite(minBodyChars) ? minBodyChars : 900;
  return chars >= minChars && (Array.isArray(paragraphs) ? paragraphs.length : 0) >= 3;
}

function buildEmergencyStructure(topic, sourceHint) {
  const sourceFacts = extractFactSnippetsFromSource(sourceHint);
  const lead =
    sourceFacts[0] ||
    `По теме «${topic}» появились новые сообщения в открытых публикациях, которые уже вызвали заметный интерес.`;
  const details =
    sourceFacts[1] ||
    `В доступных сообщениях зафиксированы ключевые факты и числовые показатели по теме.`;
  const context =
    sourceFacts[2] ||
    `Часть деталей еще сверяется по первоисточникам и официальным публикациям.`;

  return [
    trimToSentenceBoundary(lead, 240),
    trimToSentenceBoundary(details, 240),
    trimToSentenceBoundary(context, 220),
  ];
}

function enforceStructuredArticle({ title, topic, shortDescription, paragraphs, sourceHint, categorySlug }) {
  const sourceFacts = extractFactSnippetsFromSource(sourceHint);
  const cleanedGenerated = (Array.isArray(paragraphs) ? paragraphs : [])
    .map((p) => normalizeWhitespace(p))
    .filter(Boolean)
    .filter((p) => !/^source context\s*:/i.test(p))
    .filter((p) => !/^facts from related items\s*:/i.test(p))
    .filter((p) => !/^факты на сейчас:/i.test(p))
    .filter((p) => !/^что делать читателю сейчас:/i.test(p))
    .filter((p) => !/^\d\)\s/.test(p))
    .filter((p) => !/^(rule|source_type|news_source|news_facts|source_domain|source_published_at)\s*:/i.test(p))
    .filter((p) => !/это важно для аудитории|это важно для/i.test(p));

  const lead =
    cleanedGenerated.find((p) => countFactSignals(p) >= 2) ||
    sourceFacts[0] ||
    cleanedGenerated[0] ||
    `По теме «${topic}» опубликованы новые данные, часть деталей пока уточняется.`;

  const contextLine =
    cleanedGenerated.find((p) => p !== lead && p.length > 35) ||
    sourceFacts[1] ||
    cleanedGenerated[1] ||
    'На момент публикации доступны подтвержденные факты и базовые числовые данные.';

  const extraLine =
    cleanedGenerated.find((p) => p !== lead && p !== contextLine && p.length > 35) ||
    sourceFacts[2] ||
    '';

  const structured = [
    trimToSentenceBoundary(lead, 220),
    trimToSentenceBoundary(contextLine, 260),
    extraLine ? trimToSentenceBoundary(extraLine, 220) : '',
  ].filter(Boolean);

  return {
    title: normalizeWhitespace(title || `${topic}: главное`),
    shortDescription: normalizeSeoDescription(shortDescription, structured, topic),
    paragraphs: structured,
  };
}

function normalizeForDedup(text) {
  const source = normalizeWhitespace(String(text || '').toLowerCase());
  return transliterate(source)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeTokenSet(text) {
  return new Set(
    normalizeForDedup(text)
      .split(' ')
      .filter((token) => token.length > 2)
  );
}

function jaccardSimilarity(aSet, bSet) {
  if (!aSet.size || !bSet.size) return 0;
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }
  const union = aSet.size + bSet.size - intersection;
  return union ? intersection / union : 0;
}

async function fetchRecentPostsForDedup() {
  const lookbackDays = Number.isFinite(dedupLookbackDays) && dedupLookbackDays > 0 ? dedupLookbackDays : 21;
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  const recent = await client.fetch(
    '*[_type == "post" && coalesce(publishedAt, _createdAt) >= $since]{ _id, title, shortDescription, publishedAt, _createdAt, "slug": slug.current }',
    { since }
  );

  return Array.isArray(recent) ? recent : [];
}

function isLikelyDuplicate(candidateText, existingPost) {
  const candidate = normalizeForDedup(candidateText);
  const existingTitle = normalizeForDedup(existingPost?.title || '');
  if (!candidate || !existingTitle) return false;

  if (candidate === existingTitle) return true;

  if (candidate.length >= 24 && existingTitle.length >= 24) {
    if (candidate.includes(existingTitle) || existingTitle.includes(candidate)) {
      return true;
    }
  }

  const candidateTokens = makeTokenSet(candidate);
  const existingTokens = makeTokenSet(existingTitle);
  const similarity = jaccardSimilarity(candidateTokens, existingTokens);
  const minSimilarity = Number.isFinite(dedupMinSimilarity) ? dedupMinSimilarity : 0.82;
  return similarity >= minSimilarity;
}

function findDuplicatePost({ topic, title, recentPosts }) {
  const variants = [topic, title].filter(Boolean);
  for (const existing of recentPosts) {
    for (const value of variants) {
      if (isLikelyDuplicate(value, existing)) {
        return existing;
      }
    }
  }
  return null;
}

function sanitizeTemporalReferences(draft, sourceHint) {
  const trustedYears = extractYears(sourceHint || '');
  trustedYears.add(currentYear);

  const clean = {
    ...draft,
    title: stripBannedPhrases(normalizeWhitespace(stripUntrustedYears(draft?.title || '', trustedYears))),
    shortDescription: stripBannedPhrases(normalizeWhitespace(stripUntrustedYears(draft?.shortDescription || '', trustedYears))),
    paragraphs: (draft?.paragraphs || []).map((p) =>
      stripBannedPhrases(normalizeWhitespace(stripUntrustedYears(p, trustedYears)))
    ),
  };

  return clean;
}

async function rewriteWithFactCheck(topic, sourceHint, draft, isBreaking = false, context = {}) {
  if (!openAiApiKey || !enableFactCheck) return draft;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiModel,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'Ты фактчек-редактор новостей.',
            NEWS1_EDITOR_PROMPT,
            'Перепиши текст строго по подтверждаемым фактам из sourceHint.',
            'Удали общие фразы и воду.',
            'Добавь конкретику: цифры, даты, имена, организации.',
            'Если точных данных мало, явно пиши: \"данные уточняются\".',
            'Пиши как живой новостной репортер: короткий лид и фактические абзацы без оценок и советов.',
            'Никаких чеклистов, нумерованных списков и формулировок в стиле шаблона.',
            'Не используй фразы: «в современном мире», «следует отметить», «как известно», «данная ситуация».',
            context?.expand ? 'Раскрой тему глубже: 5-7 полноценных абзацев с фактами, цифрами и цитатами.' : '',
            'Верни только JSON.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({
            topic,
            category: context?.category || '',
            language: context?.language || 'ru',
            sourceHint,
            isBreaking,
            draft,
            outputSchema: {
              title: 'string <= 90',
              shortDescription: 'string 140-220',
              paragraphs: isBreaking ? 'array 3-4' : context?.expand ? 'array 5-7' : 'array 4-6',
              imageQuery: 'string',
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) return draft;

  const data = await response.json();
  const jsonText = extractJson(data?.choices?.[0]?.message?.content);
  if (!jsonText) return draft;

  try {
    const parsed = JSON.parse(jsonText);
    const title = String(parsed?.title || '').trim();
    const shortDescription = String(parsed?.shortDescription || '').trim();
    const paragraphs = Array.isArray(parsed?.paragraphs)
      ? parsed.paragraphs.map((x) => String(x || '').trim()).filter(Boolean)
      : [];
    const imageQuery = String(parsed?.imageQuery || '').trim();

    if (!title || !shortDescription || paragraphs.length < 2) return draft;

    return {
      title: title.slice(0, 120),
      shortDescription: shortDescription.slice(0, 260),
      paragraphs: paragraphs.slice(0, isBreaking ? 4 : 6),
      imageQuery: imageQuery || draft?.imageQuery || topic,
    };
  } catch {
    return draft;
  }
}

async function generateUniqueArticle(topic, sourceHint = '', context = {}) {
  if (!openAiApiKey) {
    return fallbackDraft(topic);
  }

  const system = [
    NEWS1_EDITOR_PROMPT,
    'Ты редактор новостей Казахстана.',
    'Пиши уникально, без копипаста, на русском языке.',
    'Не выдумывай факты: если фактов мало, так и укажи нейтрально.',
    'Избегай пустых фраз и размытой аналитики.',
    'Опирайся на конкретику: цифры, даты, имена, организации, прямые факты.',
    'Фактологию бери только из новостных источников в sourceHint.',
    `Текущая дата: ${nowIsoDate}.`,
    `Текущий год: ${currentYear}.`,
    'Фокусируй текст на актуальной повестке текущего года.',
    'Не указывай прошлые годы (например 2024/2025), если они не подтверждены во входных данных.',
    'Если дата не подтверждена, пиши без конкретного года.',
    'Пиши в журналистском стиле: лид с фактом, затем только подтвержденные детали без выводов и советов.',
    'Запрещены искусственные чеклисты, нумерация 1)2)3), канцелярские фразы.',
    'Не используй фразы: «в современном мире», «следует отметить», «как известно», «данная ситуация».',
    'Верни только JSON без лишнего текста.',
  ].join(' ');

  const user = {
    task: 'Сгенерируй качественную новостную статью для News1.kz.',
    topic,
    category: context?.category || '',
    categoryUrls: context?.categoryUrls || '',
    keywords: context?.keywords || [],
    language: context?.language || 'ru',
    wordCount: context?.wordCount || 300,
    sourceUrls: context?.sourceUrls || [],
    country: 'Казахстан',
    sourceHint,
    outputSchema: {
      title: 'string, до 90 символов',
      shortDescription: 'string, 140-220 символов',
      paragraphs: 'array из 4-6 строк: лид и фактические абзацы по теме',
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

    const draft = {
      title: title.slice(0, 120),
      shortDescription: shortDescription.slice(0, 260),
      paragraphs: paragraphs.slice(0, 6),
      imageQuery: imageQuery || topic,
    };
    let sanitized = sanitizeTemporalReferences(draft, sourceHint);

    if (draftLooksWatery(sanitized)) {
      const rewritten = await rewriteWithFactCheck(topic, sourceHint, sanitized, false, context);
      sanitized = sanitizeTemporalReferences(rewritten, sourceHint);
    }

    return sanitized;
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

async function resolveMainImageRef({ imageQuery, slug }) {
  const pexelsImage = await fetchPexelsImage(imageQuery);
  const selectedUrl = pexelsImage?.imageUrl || fallbackImageUrl;
  if (!selectedUrl) return null;

  const assetId = await uploadImageAsset(selectedUrl, slug);
  if (!assetId) return null;

  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
  };
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

async function pingSitemap() {
  const pingSecret = process.env.PING_WEBHOOK_SECRET;
  if (!pingSecret) {
    return { skipped: 'Missing PING_WEBHOOK_SECRET' };
  }

  try {
    const response = await fetch(`${siteUrl}/api/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: pingSecret }),
    });

    if (!response.ok) {
      const details = await response.text();
      return { error: `Ping failed (${response.status}): ${details}` };
    }

    return { success: true };
  } catch (error) {
    return { error: error?.message || String(error) };
  }
}

async function fetchRssItems({ urls, maxItemsPerFeed, sourceType, sourceLabel }) {
  const collected = [];

  for (const rawUrl of urls) {
    const url = toSafeUrl(rawUrl);
    if (!url) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      const feed = await parser.parseURL(url);
      const items = (feed.items || []).slice(0, Math.max(1, maxItemsPerFeed));
      for (const item of items) {
        const title = stripSourceSuffix(cleanFeedText(item?.title || ''));
        if (!title) continue;
        const contentSnippet = cleanFeedText(item?.contentSnippet || feed?.title || '');
        const content = cleanFeedText(item?.content || item?.contentSnippet || '');
        const prepared = {
          title,
          contentSnippet,
          content,
          link: item?.link || url,
          sourceType,
        };
        const relevanceScore = relevanceScoreForItem(prepared);
        if (relevanceScore < minRelevanceScore) continue;

        collected.push({
          ...prepared,
          relevanceScore,
          eventKey: toEventKey(title),
          rawPublishedAt: item?.pubDate || item?.isoDate || null,
          sourceDomain: (() => {
            try {
              return new URL(prepared.link).hostname;
            } catch {
              return '';
            }
          })(),
          link: item?.link || url,
        });
      }
    } catch (error) {
      console.warn(`${sourceLabel} failed: ${url} (${error?.message || error})`);
    }
  }

  return collected;
}

async function fetchGoogleNewsItems() {
  return fetchRssItems({
    urls: googleNewsRssUrls,
    maxItemsPerFeed: googleNewsMaxItems,
    sourceType: 'news',
    sourceLabel: 'Google News RSS',
  });
}

async function fetchExtraNewsItems() {
  return fetchRssItems({
    urls: extraNewsRssUrls,
    maxItemsPerFeed: extraNewsMaxItems,
    sourceType: 'trusted_rss',
    sourceLabel: 'Extra RSS',
  });
}

function mergeAndDedupSourceItems(primaryItems, secondaryItems) {
  const makeFactEntry = (x) =>
    [x?.title, x?.contentSnippet, x?.content, x?.link].filter(Boolean).join(' | ');

  const merged = primaryItems.map((x) => ({
    ...x,
    sourceType: x?.sourceType || 'news',
    newsFacts: [],
  }));

  for (const candidate of secondaryItems) {
    const duplicate = merged.find(
      (x) =>
        (candidate?.eventKey && x?.eventKey && candidate.eventKey === x.eventKey) ||
        isLikelyDuplicate(candidate?.title, { title: x?.title })
    );
    if (duplicate) {
      const factEntry = makeFactEntry(candidate);
      const exists = (duplicate.newsFacts || []).some(
        (v) => normalizeForDedup(v) === normalizeForDedup(factEntry)
      );
      if (factEntry && !exists) {
        duplicate.newsFacts.push(factEntry);
      }
      duplicate.relevanceScore = Math.max(Number(duplicate.relevanceScore || 0), Number(candidate.relevanceScore || 0));
      continue;
    }

    merged.push({
      ...candidate,
      sourceType: candidate?.sourceType || 'news',
      newsFacts: [makeFactEntry(candidate)].filter(Boolean),
    });
  }

  return merged.slice(0, Math.max(1, pipelineMaxItems));
}

function buildSourceHint(item) {
  const sourcePart = [item?.contentSnippet, item?.content, item?.link]
    .map((x) => cleanFeedText(x))
    .filter(Boolean)
    .filter((value, index, arr) => arr.findIndex((x) => normalizeForDedup(x) === normalizeForDedup(value)) === index)
    .join(' | ');
  const uniqueFacts = (Array.isArray(item?.newsFacts) ? item.newsFacts : [])
    .map((x) => cleanFeedText(x))
    .filter(Boolean)
    .filter((value, index, arr) => arr.findIndex((x) => normalizeForDedup(x) === normalizeForDedup(value)) === index)
    .slice(0, 4);
  const factsPart = uniqueFacts.join(' || ');

  return [
    'Use only confirmed facts from these news materials. No service labels in output.',
    sourcePart ? `Source context: ${sourcePart}` : '',
    factsPart ? `Facts from related items: ${factsPart}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
}

async function run() {
  console.log('Fetching sources: Google News RSS + Extra RSS');
  const googleItems = await fetchGoogleNewsItems();
  const extraItems = await fetchExtraNewsItems();
  console.log(`Google News candidates after relevance filter: ${googleItems.length}`);
  console.log(`Extra RSS candidates after relevance filter: ${extraItems.length}`);
  const items = mergeAndDedupSourceItems([], [...googleItems, ...extraItems]).sort(
    (a, b) => Number(b.relevanceScore || 0) - Number(a.relevanceScore || 0)
  );
  console.log(`Queue after event dedup: ${items.length}`);

  if (!items.length) {
    console.log('No source items found.');
    return;
  }

  const authorId = await getOrCreateAuthor();
  const categories = await getCategories();
  const fallbackCategoryRef = categories[0] || (await getAnyCategoryRef());
  const recentPostsForDedup = await fetchRecentPostsForDedup();

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

    const sourceHint = buildSourceHint(item);
    const categoryHint = rankCategoriesByKeywords(topic, categories)?.slug || categories?.[0]?.slug || '';
    const generationContext = {
      category: categoryHint,
      keywords: makeTokenSet(topic) ? Array.from(makeTokenSet(topic)).slice(0, 8) : [],
      sourceUrls: [item?.link].filter(Boolean),
      language: 'ru',
      wordCount: 480,
    };
    // eslint-disable-next-line no-await-in-loop
    const generated = await generateUniqueArticle(topic, sourceHint, generationContext);

    // eslint-disable-next-line no-await-in-loop
    const pickedCategory = await pickCategory(categories, topic, generated);

    const rawTitle = generated.title || `${topic}: главное`;
    const rawDescription = generated.shortDescription || `Разбор темы «${topic}».`;
    let paragraphs = generated.paragraphs?.length ? generated.paragraphs : fallbackDraft(topic).paragraphs;

    let structured = enforceStructuredArticle({
      title: rawTitle,
      topic,
      shortDescription: rawDescription,
      paragraphs,
      sourceHint,
      categorySlug: pickedCategory?.slug || '',
    });

    if (!hasRequiredStructure(structured.paragraphs)) {
      const forcedDraft = {
        title: rawTitle,
        shortDescription: rawDescription,
        paragraphs,
        imageQuery: generated.imageQuery || topic,
      };
      // eslint-disable-next-line no-await-in-loop
      const rewritten = await rewriteWithFactCheck(topic, sourceHint, forcedDraft, false, generationContext);
      structured = enforceStructuredArticle({
        title: rewritten?.title || rawTitle,
        topic,
        shortDescription: rewritten?.shortDescription || rawDescription,
        paragraphs: rewritten?.paragraphs?.length ? rewritten.paragraphs : paragraphs,
        sourceHint,
        categorySlug: pickedCategory?.slug || '',
      });
    }

    if (!hasRequiredStructure(structured.paragraphs)) {
      console.log(`Low-structure source, applying emergency fallback: ${topic}`);
      structured = {
        ...structured,
        title: structured.title || rawTitle,
        shortDescription: structured.shortDescription || rawDescription,
        paragraphs: buildEmergencyStructure(topic, sourceHint),
      };
    }

    paragraphs = sanitizeLegacyTemplatePhrases(structured.paragraphs);
    const safeTitle = normalizeSeoTitle(structured.title || rawTitle, topic);
    let safeDescription = normalizeSeoDescription(structured.shortDescription || rawDescription, paragraphs, topic);
    safeDescription = safeDescription
      .replace(/факты на сейчас:\s*/gi, '')
      .replace(/что делать читателю сейчас:\s*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (containsLegacyTemplatePhrases(paragraphs, safeDescription)) {
      paragraphs = sanitizeLegacyTemplatePhrases(paragraphs);
      safeDescription = safeDescription
        .replace(/факты на сейчас:\s*/gi, '')
        .replace(/что делать читателю сейчас:\s*/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    if (!hasSufficientLength(paragraphs)) {
      const expandDraft = {
        title: safeTitle,
        shortDescription: safeDescription,
        paragraphs,
        imageQuery: generated.imageQuery || topic,
      };
      // eslint-disable-next-line no-await-in-loop
      const expanded = await rewriteWithFactCheck(topic, sourceHint, expandDraft, false, {
        ...generationContext,
        expand: true,
        wordCount: 620,
      });
      const expandedStructured = enforceStructuredArticle({
        title: expanded?.title || safeTitle,
        topic,
        shortDescription: expanded?.shortDescription || safeDescription,
        paragraphs: expanded?.paragraphs?.length ? expanded.paragraphs : paragraphs,
        sourceHint,
        categorySlug: pickedCategory?.slug || '',
      });
      paragraphs = sanitizeLegacyTemplatePhrases(expandedStructured.paragraphs);
      safeDescription = normalizeSeoDescription(
        expandedStructured.shortDescription || safeDescription,
        paragraphs,
        topic
      );
    }

    if (!hasSufficientLength(paragraphs)) {
      paragraphs = buildEmergencyStructure(topic, sourceHint);
      safeDescription = normalizeSeoDescription(safeDescription, paragraphs, topic);
    }

    const duplicate = findDuplicatePost({
      topic,
      title: safeTitle,
      recentPosts: recentPostsForDedup,
    });
    if (duplicate?._id) {
      console.log(`Skip duplicate content: "${safeTitle}" ~= "${duplicate.title}" (${duplicate.slug || duplicate._id})`);
      skippedCount += 1;
      continue;
    }

    const imageQuery = generated.imageQuery || topic;
    let imageAssetRef;
    if (!dryRun) {
      // eslint-disable-next-line no-await-in-loop
      imageAssetRef = await resolveMainImageRef({ imageQuery, slug });
    }

    const docId = autoPublish ? crypto.randomUUID() : `drafts.${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    const postDoc = {
      _id: docId,
      _type: 'post',
      title: safeTitle,
      slug: { _type: 'slug', current: slug },
      author: { _type: 'reference', _ref: authorId },
      category: (pickedCategory?._id || fallbackCategoryRef?._id)
        ? { _type: 'reference', _ref: pickedCategory?._id || fallbackCategoryRef?._id }
        : undefined,
      publishedAt: nowIso,
      dateModified: nowIso,
      shortDescription: safeDescription,
      featured: false,
      body: makeBodyBlocks(paragraphs),
      mainImage: imageAssetRef,
    };

    if (dryRun) {
      console.log(`[DRY_RUN] Would create ${autoPublish ? 'published' : 'draft'} post: ${safeTitle}`);
      recentPostsForDedup.push({
        _id: `dry-${slug}`,
        title: safeTitle,
        shortDescription: safeDescription,
        slug,
      });
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

    recentPostsForDedup.push({
      _id: postDoc._id,
      title: safeTitle,
      shortDescription: safeDescription,
      slug,
      publishedAt: postDoc.publishedAt,
    });

    createdCount += 1;
  }

  if (!dryRun && autoPublish && createdCount > 0) {
    const pingResult = await pingSitemap();
    console.log(`Sitemap ping: ${JSON.stringify(pingResult)}`);
  }

  console.log(`Done. Created: ${createdCount}, skipped: ${skippedCount}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
