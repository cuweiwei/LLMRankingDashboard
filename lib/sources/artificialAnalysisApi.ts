import { modelAliases, resolveCanonicalModelId } from "@/lib/models/aliases";
import { calculateBlendedCost } from "@/lib/utils/cost";
import type { BenchmarkId, BenchmarkResult, Model, Pricing } from "@/types/models";

const API_BASE_URL = "https://artificialanalysis.ai/api/v2/language/models";
const SOURCE_URL = "https://artificialanalysis.ai/data-api/docs";

export interface AAModel {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  release_date?: unknown;
  model_creator?: { name?: unknown };
  evaluations?: Record<string, unknown>;
  pricing?: { price_1m_input_tokens?: unknown; price_1m_output_tokens?: unknown };
  licensing?: unknown;
  huggingface_url?: unknown;
  open_weights_url?: unknown;
  score?: unknown;
  task_success_rate?: unknown;
  rank?: unknown;
}

interface AAPage {
  data?: unknown;
  pagination?: { has_more?: unknown };
}

export class SourceFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceFetchError";
  }
}

export async function fetchArtificialAnalysisModels(): Promise<AAModel[]> {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!apiKey) throw new SourceFetchError("ARTIFICIAL_ANALYSIS_API_KEY is not configured");
  const configuredTier = process.env.ARTIFICIAL_ANALYSIS_API_TIER;
  const tier = configuredTier === "pro" || configuredTier === "commercial" ? configuredTier : "free";
  const endpoint = tier === "free" ? `${API_BASE_URL}/free` : API_BASE_URL;

  const allModels: AAModel[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(`${endpoint}?page=${page}`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new SourceFetchError(`Artificial Analysis API returned HTTP ${response.status}`);
    const body = (await response.json()) as AAPage;
    if (!Array.isArray(body.data)) throw new SourceFetchError("Artificial Analysis API returned an unexpected data shape");
    allModels.push(...body.data.filter((item): item is AAModel => Boolean(item && typeof item === "object")));
    if (body.pagination?.has_more !== true) break;
  }
  if (allModels.length === 0) throw new SourceFetchError("Artificial Analysis API returned no models");
  return allModels;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findCanonicalModel(row: AAModel, models: Model[]): Model | undefined {
  if (typeof row.id === "string") {
    const upstreamMatch = models.find((model) => model.upstream_id === row.id);
    if (upstreamMatch) return upstreamMatch;
  }
  if (typeof row.slug === "string") {
    const slugMatch = models.find((model) => model.upstream_slug === row.slug);
    if (slugMatch) return slugMatch;
  }
  const names = [row.name, row.slug].filter((value): value is string => typeof value === "string");
  const canonicalIds = names.map((name) => resolveCanonicalModelId(name, modelAliases));
  return models.find((model) => {
    const candidates = [model.id, model.name, model.id.split(":")[1]];
    return candidates.some((candidate) => canonicalIds.includes(candidate) || names.some((name) => normalizeName(candidate) === normalizeName(name)));
  });
}

function numeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function scoreFromRow(row: AAModel, scoreFields: string[]): number | undefined {
  const candidates = [
    ...(row.evaluations ? scoreFields.map((field) => row.evaluations?.[field]) : []),
    ...scoreFields.map((field) => (row as Record<string, unknown>)[field]),
    ...(scoreFields.includes("score") ? [row.score] : []),
    ...(scoreFields.includes("task_success_rate") ? [row.task_success_rate] : []),
  ];
  return candidates.find(numeric);
}

export function normalizeBenchmarkResults(
  rows: AAModel[],
  benchmarkId: BenchmarkId,
  scoreFields: string[],
  models: Model[],
  sourceUrl = SOURCE_URL,
): BenchmarkResult[] {
  const normalized = rows.flatMap((row) => {
    const model = findCanonicalModel(row, models);
    const score = scoreFromRow(row, scoreFields);
    if (!model || score === undefined) return [];
    return [{
      benchmark_id: benchmarkId,
      model_id: model.id,
      benchmark_rank: 0,
      score,
      benchmark_updated_at: new Date().toISOString(),
      source_url: sourceUrl,
      data_source: "live" as const,
    }];
  });
  const deduplicated = [...new Map(normalized.map((entry) => [entry.model_id, entry])).values()];
  return deduplicated.sort((left, right) => right.score - left.score).map((entry, index) => ({ ...entry, benchmark_rank: index + 1 }));
}

export function normalizePricing(rows: AAModel[], models: Model[]): Pricing[] {
  const normalized = rows.flatMap((row) => {
    const model = findCanonicalModel(row, models);
    const input = row.pricing?.price_1m_input_tokens;
    const output = row.pricing?.price_1m_output_tokens;
    if (!model || !numeric(input) || !numeric(output) || input < 0 || output < 0) return [];
    return [{
      model_id: model.id,
      pricing_provider: "Artificial Analysis median provider pricing",
      input_cost_per_million_tokens: input,
      output_cost_per_million_tokens: output,
      blended_cost_per_million_tokens: calculateBlendedCost(input, output),
      pricing_checked_at: new Date().toISOString(),
      source_url: SOURCE_URL,
      data_source: "live" as const,
    }];
  });
  return [...new Map(normalized.map((entry) => [entry.model_id, entry])).values()];
}
