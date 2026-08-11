export type BenchmarkId = "enterpriseops" | "coding-agent-index" | "gdpval";
export type ModelAccess = "open" | "closed" | "unknown";
export type DataSource = "seed" | "live" | "cache";
export type SourceStatus = "success" | "fallback" | "failed";
export type SortMode = "score" | "cost-asc" | "cost-desc";

export interface Model {
  id: string;
  name: string;
  provider: string;
  model_access: ModelAccess;
  configuration?: string;
  release_date?: string;
}

export interface ModelAlias {
  canonical_model_id: string;
  aliases: string[];
}

export interface BenchmarkResult {
  benchmark_id: BenchmarkId;
  model_id: string;
  benchmark_rank: number;
  score: number;
  benchmark_updated_at?: string;
  source_url: string;
  data_source: DataSource;
}

export interface Pricing {
  model_id: string;
  pricing_provider: string;
  input_cost_per_million_tokens?: number;
  output_cost_per_million_tokens?: number;
  blended_cost_per_million_tokens?: number;
  pricing_checked_at?: string;
  source_url: string;
  data_source: DataSource;
}

export interface LeaderboardEntry {
  model: Model;
  benchmark: BenchmarkResult;
  pricing?: Pricing;
}

export interface BenchmarkDefinition {
  id: BenchmarkId;
  displayName: string;
  benchmarkName: string;
  subtitle: string;
  sourceUrl: string;
  updatedAt: string;
}

export interface SourceRefreshStatus {
  last_attempted_update: string;
  last_successful_update?: string;
  status: SourceStatus;
  error?: string;
  record_count?: number;
}

export interface DataMetadata {
  generated_at: string;
  sources: Record<BenchmarkId | "pricing", SourceRefreshStatus>;
}

export interface DashboardSnapshot {
  models: Model[];
  benchmarks: Record<BenchmarkId, BenchmarkResult[]>;
  pricing: Pricing[];
  definitions: BenchmarkDefinition[];
  aliases: ModelAlias[];
  lastUpdated: string;
  dataSource: DataSource;
  metadata: DataMetadata;
}

export interface DashboardFilters {
  access: Exclude<ModelAccess, "unknown"> | "all";
  sort: SortMode;
  query: string;
  provider: string;
}

export interface DisplayEntry extends LeaderboardEntry {
  displayPosition: number;
  hasCost: boolean;
}
