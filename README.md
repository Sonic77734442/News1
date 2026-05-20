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

## Auto News Pipeline (Google Trends -> AI -> Sanity)

Run once manually:

```bash
npm run content:trends:drafts
```

For direct publish + social push (Windows-friendly script):

```bash
npm run content:trends:auto
```

### Pipeline behavior

- Reads Google Trends RSS (`TRENDS_GEO`, default `KZ`).
- Generates unique article text with OpenAI (if `OPENAI_API_KEY` is set).
- Selects image from Pexels and uploads it into `mainImage` (if `PEXELS_API_KEY` is set).
- Creates draft posts by default.
- Creates published posts when `AUTO_PUBLISH=1`.
- Pushes published posts to Telegram/Facebook when `AUTO_PUSH_SOCIAL=1`.

### Pipeline variables

- `TRENDS_GEO` (default: `KZ`)
- `TRENDS_MAX_ITEMS` (default: `5`)
- `AUTO_CONTENT_AUTHOR_NAME` (default: `News1.kz`)
- `DRY_RUN=1` (preview, does not write to Sanity)
- `AUTO_PUBLISH=1` (create published posts instead of drafts)
- `AUTO_PUSH_SOCIAL=1` (push to socials after publish)
- `SITE_URL` (default: `https://news1.kz`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `PEXELS_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL`
- `FB_PAGE_ID`
- `FB_PAGE_TOKEN`

## Scheduled Automation (GitHub Actions)

Workflow file added: `.github/workflows/auto-news-pipeline.yml`.

It runs every 2 hours and can also be started manually (`workflow_dispatch`).

Set these in GitHub:

- **Secrets:** `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `OPENAI_API_KEY`, `PEXELS_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL`, `FB_PAGE_ID`, `FB_PAGE_TOKEN`
- **Repository Variables:** `OPENAI_MODEL`, `TRENDS_GEO`, `TRENDS_MAX_ITEMS`, `AUTO_CONTENT_AUTHOR_NAME`, `AUTO_PUBLISH`, `AUTO_PUSH_SOCIAL`, `SITE_URL`
