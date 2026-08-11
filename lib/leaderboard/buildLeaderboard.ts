import type { BenchmarkId, DashboardFilters, DisplayEntry, LeaderboardEntry, Model, Pricing, BenchmarkResult } from "@/types/models";
import { filterEntries } from "./filters";
import { sortAndLimitEntries } from "./sorting";

export function buildLeaderboard(
  benchmarkId: BenchmarkId,
  models: Model[],
  results: BenchmarkResult[],
  pricing: Pricing[],
  filters: DashboardFilters,
): DisplayEntry[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const priceById = new Map(pricing.map((item) => [item.model_id, item]));
  const entries: LeaderboardEntry[] = results.flatMap((benchmark) => {
      const model = modelById.get(benchmark.model_id);
      if (!model || benchmark.benchmark_id !== benchmarkId || !Number.isFinite(benchmark.score)) return [];
      return [{ model, benchmark, pricing: priceById.get(model.id) }];
    });

  return sortAndLimitEntries(filterEntries(entries, filters), filters.sort);
}
