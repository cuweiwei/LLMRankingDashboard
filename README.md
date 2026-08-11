# LLM Frontier Dashboard

An operational, use-case-first dashboard for comparing frontier language models across three practical workflows:

- **Personal Agent** — EnterpriseOps-Gym-AA
- **Coding** — Artificial Analysis Coding Agent Index
- **Knowledge Work** — GDPval-AA v2

The dashboard keeps the three benchmark scales independent. It answers “which model is best for this workflow, and what does it cost?” instead of collapsing unrelated benchmarks into one universal score.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npm run data:validate
npm run build
npm run build:pages
```

`npm run build` creates the static export in `out/`. Preview that export locally with:

```bash
npm run start
```

## Zero-cost GitHub-only architecture

This repository is configured for a project site at:

```text
https://cuweiwei.github.io/LLMRankingDashboard/
```

The application has no persistent backend, database, Vercel dependency, serverless runtime, or browser-side scraping. GitHub Actions fetches and validates data, commits the static JSON snapshot, and GitHub Pages serves the static Next.js export. The static export uses `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, and a build-time `basePath` of `/LLMRankingDashboard` when `GITHUB_PAGES=true`.

The workflow in `.github/workflows/deploy-pages.yml` runs data validation, lint, type-checking, tests, builds the `out/` directory, and deploys it with GitHub Pages.

After the workflow is pushed, enable **Settings → Pages → Source: GitHub Actions** in the repository if it is not already enabled. Future pushes to `main` redeploy automatically.

GitHub Pages is static hosting, so live benchmark refresh runs in GitHub Actions rather than in the browser. The current data is bundled into the build; updating `data/*.json` and pushing to `main` is the supported refresh path. There are no runtime application API routes.

## Automatic and manual data refresh

`.github/workflows/update-data.yml` runs daily at `22:15 UTC`, approximately `06:15 Asia/Taipei`, and also supports `workflow_dispatch` for manual refreshes:

```text
Repository → Actions → Update LLM Data → Run workflow
```

The updater attempts each source independently, normalizes and validates candidates, rejects suspicious record loss, writes through temporary files, then atomically replaces only successful datasets. Failed sources retain the previous valid JSON and record `fallback` status in `data/metadata.json`. The workflow commits only when files under `data/` changed; a data update then triggers the Pages deployment workflow through the `main` branch push.

The optional `ARTIFICIAL_ANALYSIS_API_KEY` belongs only in GitHub Actions Secrets. The first run works without it using the checked-in fallback dataset; no client-side secret or paid service is required.

## What is included

The page has exactly three primary leaderboard sections and three summary cards. Global access, provider, sort and search filters apply to every section. Filters persist in the URL:

```text
/?access=open&sort=cost-asc&provider=DeepSeek&q=v3
```

Score sorting shows the top ten eligible models by descending benchmark score. Cost sorting considers every eligible result with valid pricing, then shows the ten cheapest or most expensive models while preserving each model’s original benchmark rank.

## Cost calculation

Every pricing record stores input and output API prices separately. The reusable utility in `lib/utils/cost.ts` calculates:

```text
Blended Cost = 0.75 × input price + 0.25 × output price
```

The result is shown per one million tokens. This is a workload comparison assumption, not an Artificial Analysis benchmark metric. Cached input, batch discounts, long-context tiers and self-hosting GPU costs are intentionally excluded from the primary comparison.

## Architecture

The UI consumes normalized records only:

```text
data/*.json
   ↓
lib/validation/schemas.ts
   ↓
lib/data/index.ts
   ↓
lib/leaderboard/{filters,sorting,buildLeaderboard}.ts
   ↓
components/dashboard/*
```

Key boundaries:

- `types/models.ts` defines canonical models, benchmark results, pricing, filters and display entries.
- `lib/benchmarks/definitions.ts` defines the three benchmark cards and source URLs.
- `lib/sources/benchmarks/` contains independent EnterpriseOps, Coding Agent Index, and GDPval adapters.
- `lib/sources/pricing/` contains the independent pricing adapter.
- `lib/sources/artificialAnalysisApi.ts` uses the documented Artificial Analysis free API when `ARTIFICIAL_ANALYSIS_API_KEY` is present and never exposes that key to the browser.
- `scripts/update-data.ts` orchestrates fetch → normalize → validate → atomic write → fallback.
- `scripts/validate-data.ts` validates schema, duplicate IDs/ranks, model references, and suspiciously small datasets.
- `data/metadata.json` records `generated_at`, attempted/successful timestamps, source status, errors, and record counts.
- `data_source: "seed"` is preserved in the bundled records, and the UI explicitly identifies the snapshot as illustrative seed data.

## Updating benchmark data

Replace or generate the corresponding JSON files with records that satisfy the schemas. Keep these fields intact:

- benchmark: `benchmark_id`, `model_id`, `benchmark_rank`, `score`, `source_url`, `benchmark_updated_at`
- pricing: `model_id`, `pricing_provider`, input/output prices, `pricing_checked_at`, `source_url`

Use canonical model IDs from `data/models.json`. If an upstream source uses a different display name, add the alias to `lib/models/aliases.ts`; do not join records using raw display names.

For further live ingestion, implement the fetch logic in the adapters, validate records before caching them, and keep the local JSON snapshot as the failure fallback. Do not bypass authentication, bot protection, rate limits, robots restrictions or site terms.

## Adding another model

1. Add one model metadata record to `data/models.json`.
2. Add its benchmark results to each applicable benchmark JSON file.
3. Add standard hosted API pricing to `data/pricing.json` when a reliable source exists.
4. Add an alias only when upstream naming differs from the canonical ID.

Models without pricing remain visible in score ranking but are excluded from cost sorting. Unknown access is retained as `UNKNOWN` rather than guessed.

## Adding another benchmark

1. Add a new `BenchmarkId` in `types/models.ts`.
2. Add its definition and source URL in `lib/benchmarks/definitions.ts`.
3. Add a validated data file and include it in `loadDashboardSnapshot()`.
4. Add the adapter and one leaderboard section ID. The ranking/filter/table components are benchmark-agnostic.

## Data sources and limitations

The dashboard links each board to the public Artificial Analysis benchmark page and each pricing popover to the selected provider. The bundled numbers are illustrative seed records so the application works offline; they are not presented as current benchmark results. Refresh timestamps are intentionally visible, and stale data produces a warning after seven days for benchmarks or fourteen days for pricing.

### Data source matrix

| Source | Status | Refresh | Fallback |
|---|---|---|---|
| EnterpriseOps-Gym-AA | FALLBACK | Daily attempt | Yes |
| Coding Agent Index | FALLBACK without optional API key | Daily attempt | Yes |
| GDPval-AA v2 | FALLBACK without optional API key | Daily attempt | Yes |
| Pricing | FALLBACK without optional API key | Daily attempt | Yes |

`FALLBACK` is intentional and verified for the current local environment. The documented Artificial Analysis free API exposes coding index, agentic index, GDPval-AA Elo, and input/output pricing behind an API key; the updater has adapters for the coding, GDPval, and pricing fields. EnterpriseOps-Gym-AA is not exposed as a distinct field in that free endpoint, so it remains fallback until a reliable permitted source is available. The repository does not claim seed rows are live.

The dashboard is automatically refreshed when a configured GitHub Actions source succeeds, but it is not realtime. GitHub scheduled workflows may run later than the exact cron minute. Open-weight pricing remains provider-dependent, HTML extraction can be fragile if added later, and benchmark configurations may differ between model variants.

## Accessibility and responsive behavior

The app uses semantic headings, fieldsets, native selects, native `details` disclosures for pricing and row metadata, visible focus states, accessible table roles and a horizontally scrollable dense table on small screens. It supports light and dark color schemes through system preference and avoids large client-side UI libraries.
