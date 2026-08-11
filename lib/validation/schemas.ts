import { z } from "zod";

export const modelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().min(1),
  model_access: z.enum(["open", "closed", "unknown"]),
  upstream_id: z.string().min(1).optional(),
  upstream_slug: z.string().min(1).optional(),
  configuration: z.string().optional(),
  release_date: z.string().optional(),
});

export const benchmarkResultSchema = z.object({
  benchmark_id: z.enum(["enterpriseops", "coding-agent-index", "gdpval"]),
  model_id: z.string().min(1),
  benchmark_rank: z.number().int().positive(),
  score: z.number().finite(),
  benchmark_updated_at: z.string().optional(),
  source_url: z.string().url(),
  data_source: z.enum(["seed", "live", "cache"]),
});

export const pricingSchema = z.object({
  model_id: z.string().min(1),
  pricing_provider: z.string().min(1),
  input_cost_per_million_tokens: z.number().nonnegative().optional(),
  output_cost_per_million_tokens: z.number().nonnegative().optional(),
  blended_cost_per_million_tokens: z.number().nonnegative().optional(),
  pricing_checked_at: z.string().optional(),
  source_url: z.string().url(),
  data_source: z.enum(["seed", "live", "cache"]),
});

export const sourceRefreshStatusSchema = z.object({
  last_attempted_update: z.string().datetime(),
  last_successful_update: z.string().datetime().optional(),
  status: z.enum(["success", "fallback", "failed"]),
  error: z.string().optional(),
  record_count: z.number().int().nonnegative().optional(),
});

export const metadataSchema = z.object({
  generated_at: z.string().datetime(),
  sources: z.object({
    enterpriseops: sourceRefreshStatusSchema,
    "coding-agent-index": sourceRefreshStatusSchema,
    gdpval: sourceRefreshStatusSchema,
    pricing: sourceRefreshStatusSchema,
  }),
});
