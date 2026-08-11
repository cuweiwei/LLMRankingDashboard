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
npm run build
```

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
- `lib/providers/artificialAnalysis.ts` is the benchmark adapter boundary. It currently returns no live records because the public pages do not provide a stable unauthenticated JSON contract; validated local data remains the fallback.
- `lib/pricing/index.ts` is the independent pricing adapter boundary.
- `app/api/leaderboard/route.ts` exposes the normalized snapshot.
- `app/api/refresh/route.ts` is a safe refresh hook for a future scheduled ingestion job.
- `data_source: "seed"` is preserved in the bundled records, and the UI explicitly identifies the snapshot as illustrative seed data.

## Updating benchmark data

Replace or generate the corresponding JSON files with records that satisfy the schemas. Keep these fields intact:

- benchmark: `benchmark_id`, `model_id`, `benchmark_rank`, `score`, `source_url`, `benchmark_updated_at`
- pricing: `model_id`, `pricing_provider`, input/output prices, `pricing_checked_at`, `source_url`

Use canonical model IDs from `data/models.json`. If an upstream source uses a different display name, add the alias to `lib/models/aliases.ts`; do not join records using raw display names.

For live ingestion, implement the fetch logic in the adapters, validate records before caching them, and keep the local JSON snapshot as the failure fallback. Do not bypass authentication, bot protection, rate limits, robots restrictions or site terms.

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

The current adapter boundary is ready for daily benchmark and pricing refresh, but no remote scraper is enabled by default. A production deployment should add a server-side ingestion job with provider-specific credentials/limits as appropriate, validate and cache successful responses, and retain the last known good snapshot on failure.

## Accessibility and responsive behavior

The app uses semantic headings, fieldsets, native selects, native `details` disclosures for pricing and row metadata, visible focus states, accessible table roles and a horizontally scrollable dense table on small screens. It supports light and dark color schemes through system preference and avoids large client-side UI libraries.
