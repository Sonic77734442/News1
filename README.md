This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Set these in your deployment/runtime environment:

- `FB_PAGE_ID`
- `FB_PAGE_TOKEN`
- `FB_WEBHOOK_SECRET`
- `PING_WEBHOOK_SECRET`
- `SANITY_PROJECT_ID` (optional, default `8kp3qa75`)
- `SANITY_DATASET` (optional, default `production`)
- `SANITY_API_TOKEN` (required for auto content pipeline)

## Auto News Pipeline (Google News -> AI -> Sanity)

Run once manually:

```bash
npm run content:trends:drafts
```

For direct publish + social push (Windows-friendly script):

```bash
npm run content:trends:auto
```

### Pipeline behavior

- Reads Google News RSS feeds (`GOOGLE_NEWS_RSS_URLS`) plus extra trusted RSS feeds (`EXTRA_NEWS_RSS_URLS`).
- Generates unique article text with OpenAI (if `OPENAI_API_KEY` is set).
- Enforces readable article structure and removes legacy template phrases.
- Selects image from Pexels and uploads it into `mainImage` (if `PEXELS_API_KEY` is set).
- Creates draft posts by default.
- Creates published posts when `AUTO_PUBLISH=1`.
- Pushes published posts to Telegram/Facebook when `AUTO_PUSH_SOCIAL=1`.

### Pipeline variables

- `GOOGLE_NEWS_RSS_URLS` (comma-separated RSS URLs)
- `GOOGLE_NEWS_MAX_ITEMS` (default: `8`)
- `EXTRA_NEWS_RSS_URLS` (comma-separated trusted RSS URLs; default includes Inform + NBRK news feed)
- `EXTRA_NEWS_MAX_ITEMS` (default: `6`)
- `NEWS_MAX_ITEMS` (default: `GOOGLE_NEWS_MAX_ITEMS`)
- `MIN_RELEVANCE_SCORE` (default: `2`, higher = stricter anti-noise filter)
- `AUTO_CONTENT_AUTHOR_NAME` (default: `News1.kz`)
- `DEDUP_LOOKBACK_DAYS` (default: `21`)
- `DEDUP_MIN_SIMILARITY` (default: `0.82`)
- `ENABLE_FACT_CHECK` (default: `1`, second-pass factual rewrite)
- `MIN_FACT_SIGNALS` (default: `2`, minimum numeric/factual density)
- `MIN_BODY_CHARS` (default: `900`, minimum article body length before publish)
- `DRY_RUN=1` (preview, does not write to Sanity)
- `AUTO_PUBLISH=1` (create published posts instead of drafts)
- `AUTO_PUSH_SOCIAL=1` (push to socials after publish)
- `SITE_URL` (default: `https://news1.kz`)
- `FALLBACK_IMAGE_URL` (optional, default: `https://news1.kz/default-preview.png`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `PEXELS_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL`
- `FB_PAGE_ID`
- `FB_PAGE_TOKEN`
- `PING_WEBHOOK_SECRET` (optional, enables automatic sitemap ping after publish)

## Morning Currency Post (NBRK -> Sanity)

Run manually:

```bash
npm run content:currency:morning
```

### Currency variables

- `CURRENCY_RATES_URLS` (comma-separated XML URLs, default uses NBRK `rates_all.xml`)
- `CURRENCY_CATEGORY_SLUG` (default: `finance`)
- `AUTO_PUBLISH` (default: `1` in workflow)

## Scheduled Automation (GitHub Actions)

Workflow file added: `.github/workflows/auto-news-pipeline.yml`.

It includes:
- news generation every 2 hours,
- morning currency post at `03:10 UTC` (`08:10` in Almaty, UTC+5),
- manual trigger via `workflow_dispatch`.

Set these in GitHub:

- **Secrets:** `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `OPENAI_API_KEY`, `PEXELS_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL`, `FB_PAGE_ID`, `FB_PAGE_TOKEN`, `PING_WEBHOOK_SECRET`
- **Repository Variables:** `OPENAI_MODEL`, `GOOGLE_NEWS_RSS_URLS`, `GOOGLE_NEWS_MAX_ITEMS`, `EXTRA_NEWS_RSS_URLS`, `EXTRA_NEWS_MAX_ITEMS`, `NEWS_MAX_ITEMS`, `MIN_RELEVANCE_SCORE`, `AUTO_CONTENT_AUTHOR_NAME`, `AUTO_PUBLISH`, `AUTO_PUSH_SOCIAL`, `SITE_URL`, `FALLBACK_IMAGE_URL`, `ENABLE_FACT_CHECK`, `MIN_FACT_SIGNALS`, `MIN_BODY_CHARS`, `CURRENCY_RATES_URLS`, `CURRENCY_CATEGORY_SLUG`
