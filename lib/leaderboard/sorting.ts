import type { DisplayEntry, LeaderboardEntry, SortMode } from "@/types/models";

export function sortAndLimitEntries(entries: LeaderboardEntry[], sort: SortMode, limit = 10): DisplayEntry[] {
  const eligible = sort === "score" ? entries : entries.filter((entry) => entry.pricing?.blended_cost_per_million_tokens !== undefined);
  const sorted = [...eligible].sort((a, b) => {
    if (sort === "score") return b.benchmark.score - a.benchmark.score || a.benchmark.benchmark_rank - b.benchmark.benchmark_rank;
    const left = a.pricing?.blended_cost_per_million_tokens ?? Number.POSITIVE_INFINITY;
    const right = b.pricing?.blended_cost_per_million_tokens ?? Number.POSITIVE_INFINITY;
    return sort === "cost-asc" ? left - right : right - left;
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    ...entry,
    displayPosition: index + 1,
    hasCost: entry.pricing?.blended_cost_per_million_tokens !== undefined,
  }));
}
