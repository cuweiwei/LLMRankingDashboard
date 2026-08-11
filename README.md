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

The optional `ARTIFICIAL_ANALYSIS_API_KEY` belongs only in GitHub Actions Secrets. Set `ARTIFICIAL_ANALYSIS_API_TIER` to `free`, `pro`, or `commercial` as appropriate; it defaults to `free`. The first run works without it using the checked-in fallback dataset; no client-side secret or paid service is required. The updater uses only fields available to the configured Artificial Analysis API tier. If a tier does not return an individual benchmark field, that source remains fallback rather than inventing a score.

For Personal Agent, an optional `ENTERPRISEOPS_SOURCE_URL` Actions secret may point to a permitted JSON endpoint containing model identity plus `score` or `task_success_rate` records. The updater accepts either a JSON array or `{ "data": [...] }`. It does not scrape the Artificial Analysis HTML page.

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
- `lib/sources/artificialAnalysisApi.ts` uses the documented Artificial Analysis API when `ARTIFICIAL_ANALYSIS_API_KEY` is present and never exposes that key to the browser.
- `lib/models/registry.ts` merges upstream model identity into the local registry. `data/models.json` is durable metadata, not a model whitelist: new upstream models are added automatically when valid identity fields are returned. Unknown access stays `UNKNOWN` until a source provides evidence of downloadable weights.
- `scripts/update-data.ts` orchestrates fetch → normalize → validate → atomic write → fallback.
- `scripts/validate-data.ts` validates schema, duplicate IDs/ranks, model references, and suspiciously small datasets.
- `data/metadata.json` records `generated_at`, attempted/successful timestamps, source status, errors, and record counts.
- `data_source: "seed"` is preserved in the bundled records, and the UI explicitly identifies the snapshot as illustrative seed data.

## Updating benchmark data

Replace or generate the corresponding JSON files with records that satisfy the schemas. Keep these fields intact:

- benchmark: `benchmark_id`, `model_id`, `benchmark_rank`, `score`, `source_url`, `benchmark_updated_at`
- pricing: `model_id`, `pricing_provider`, input/output prices, `pricing_checked_at`, `source_url`

Use canonical model IDs from `data/models.json`. The updater first matches upstream IDs/slugs and known aliases; an unknown upstream model is assigned a stable `provider:slug` ID and added to the registry. Add a manual alias only when a naming variation cannot be resolved deterministically. Do not join records using raw display names only.

For further live ingestion, implement the fetch logic in the adapters, validate records before caching them, and keep the local JSON snapshot as the failure fallback. Do not bypass authentication, bot protection, rate limits, robots restrictions or site terms.

## Adding another model

1. Normally, let the updater discover the model from the upstream source and commit the registry change.
2. Add one model metadata record to `data/models.json` only for a reviewed offline seed or a source that does not expose model identity through the updater.
3. Add its benchmark results to each applicable benchmark JSON file.
4. Add standard hosted API pricing to `data/pricing.json` when a reliable source exists.
5. Add an alias only when upstream naming differs from the canonical ID.

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

`FALLBACK` is intentional and verified for the current local environment. The documented Artificial Analysis API provides a stable model endpoint and tier-dependent benchmark/pricing fields. The updater has adapters for Coding, GDPval and pricing when those fields are present for the configured key. EnterpriseOps-Gym-AA is not currently exposed as a distinct field in the API response used here. It first checks for a compatible field if one appears, then supports `ENTERPRISEOPS_SOURCE_URL` pointing to a permitted machine-readable JSON source. It deliberately does not scrape public HTML or bypass access controls. Without that source, Personal Agent remains fallback and the UI says so.

### Dynamic discovery and licensing

When an upstream response includes a new model such as `Claude Fable 5`, the updater creates a canonical registry record such as `anthropic:claude-fable-5` and then normalizes any benchmark scores returned for that model. A model with identity but no valid score is kept in the registry but is not shown in a leaderboard. A model with no reliable access evidence is marked `UNKNOWN`; the updater does not infer `OPEN` or `CLOSED` from provider name alone.

Artificial Analysis documents attribution requirements and states that its Free API is for internal use only, while external redistribution requires the appropriate rights. A public GitHub Pages deployment should therefore be treated as a redistribution use case: confirm the applicable Artificial Analysis plan and terms before enabling public live data. The repository keeps the API key server-side in GitHub Actions and never ships it to the browser, but that does not by itself grant redistribution rights.

The dashboard is automatically refreshed when a configured GitHub Actions source succeeds, but it is not realtime. GitHub scheduled workflows may run later than the exact cron minute. Open-weight pricing remains provider-dependent, HTML extraction can be fragile if added later, and benchmark configurations may differ between model variants.

## Accessibility and responsive behavior

The app uses semantic headings, fieldsets, native selects, native `details` disclosures for pricing and row metadata, visible focus states, accessible table roles and a horizontally scrollable dense table on small screens. It supports light and dark color schemes through system preference and avoids large client-side UI libraries.
