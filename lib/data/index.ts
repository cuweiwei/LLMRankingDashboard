import modelsJson from "@/data/models.json";
import enterpriseOpsJson from "@/data/enterpriseops.json";
import codingJson from "@/data/coding.json";
import gdpvalJson from "@/data/gdpval.json";
import pricingJson from "@/data/pricing.json";
import { modelAliases } from "@/lib/models/aliases";
import { benchmarkDefinitions } from "@/lib/benchmarks/definitions";
import { calculateBlendedCost } from "@/lib/utils/cost";
import { benchmarkResultSchema, modelSchema, pricingSchema } from "@/lib/validation/schemas";
import type { BenchmarkResult, DashboardSnapshot, Model, Pricing } from "@/types/models";

function validateRecords<T>(records: unknown[], schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }): T[] {
  return records.flatMap((record) => {
    const result = schema.safeParse(record);
    return result.success && result.data ? [result.data] : [];
  });
}

function normalizePricing(pricing: Pricing[]): Pricing[] {
  return pricing.map((item) => {
    const hasBoth = item.input_cost_per_million_tokens !== undefined && item.output_cost_per_million_tokens !== undefined;
    return {
      ...item,
      blended_cost_per_million_tokens: hasBoth
        ? calculateBlendedCost(item.input_cost_per_million_tokens!, item.output_cost_per_million_tokens!)
        : undefined,
    };
  });
}

export function loadDashboardSnapshot(): DashboardSnapshot {
  const models = validateRecords<Model>(modelsJson, modelSchema);
  const enterpriseops = validateRecords<BenchmarkResult>(enterpriseOpsJson, benchmarkResultSchema);
  const coding = validateRecords<BenchmarkResult>(codingJson, benchmarkResultSchema);
  const gdpval = validateRecords<BenchmarkResult>(gdpvalJson, benchmarkResultSchema);
  const pricing = normalizePricing(validateRecords<Pricing>(pricingJson, pricingSchema));

  return {
    models,
    benchmarks: { enterpriseops, "coding-agent-index": coding, gdpval },
    pricing,
    definitions: benchmarkDefinitions,
    aliases: modelAliases,
    lastUpdated: "2026-08-10T09:00:00.000Z",
    dataSource: "seed",
  };
}
