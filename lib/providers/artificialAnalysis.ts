import type { BenchmarkId, BenchmarkResult } from "@/types/models";

/**
 * Adapter boundary for a future public Artificial Analysis feed.
 * The current public pages are authoritative source links, but not a stable
 * unauthenticated JSON contract, so the app intentionally falls back to data/*.json.
 */
export async function fetchArtificialAnalysisLeaderboard(_benchmarkId: BenchmarkId): Promise<BenchmarkResult[]> {
  void _benchmarkId;
  return [];
}
