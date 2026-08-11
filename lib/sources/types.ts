import type { BenchmarkResult, BenchmarkId, Model, Pricing } from "@/types/models";
import type { AAModel } from "@/lib/sources/artificialAnalysisApi";

export interface SourceContext {
  models: Model[];
  artificialAnalysisRows?: AAModel[];
  artificialAnalysisError?: unknown;
}

export interface BenchmarkProvider {
  id: BenchmarkId;
  fetch: (context: SourceContext) => Promise<BenchmarkResult[]>;
}

export interface PricingProvider {
  id: "pricing";
  fetch: (context: SourceContext) => Promise<Pricing[]>;
}
