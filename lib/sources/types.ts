import type { BenchmarkResult, BenchmarkId, Pricing } from "@/types/models";

export interface BenchmarkProvider {
  id: BenchmarkId;
  fetch: () => Promise<BenchmarkResult[]>;
}

export interface PricingProvider {
  id: "pricing";
  fetch: () => Promise<Pricing[]>;
}
