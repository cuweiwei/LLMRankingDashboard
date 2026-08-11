import { describe, expect, it } from "vitest";
import { buildLeaderboard } from "./buildLeaderboard";
import { filterEntries } from "./filters";
import { sortAndLimitEntries } from "./sorting";
import type { DashboardFilters, LeaderboardEntry, Model, Pricing, BenchmarkResult } from "@/types/models";

const models: Model[] = [
  { id: "closed:alpha", name: "Alpha", provider: "Closed Co", model_access: "closed" },
  { id: "open:beta", name: "Beta", provider: "Open Co", model_access: "open" },
  { id: "open:gamma", name: "Gamma", provider: "Open Co", model_access: "open" },
];
const results: BenchmarkResult[] = [
  { benchmark_id: "enterpriseops", model_id: "closed:alpha", benchmark_rank: 1, score: 90, source_url: "https://example.com/bench", data_source: "seed" },
  { benchmark_id: "enterpriseops", model_id: "open:beta", benchmark_rank: 2, score: 80, source_url: "https://example.com/bench", data_source: "seed" },
  { benchmark_id: "enterpriseops", model_id: "open:gamma", benchmark_rank: 3, score: 70, source_url: "https://example.com/bench", data_source: "seed" },
];
const pricing: Pricing[] = [
  { model_id: "closed:alpha", pricing_provider: "Closed Co", input_cost_per_million_tokens: 10, output_cost_per_million_tokens: 10, blended_cost_per_million_tokens: 10, source_url: "https://example.com/price", data_source: "seed" },
  { model_id: "open:beta", pricing_provider: "Open Co", input_cost_per_million_tokens: 1, output_cost_per_million_tokens: 3, blended_cost_per_million_tokens: 1.5, source_url: "https://example.com/price", data_source: "seed" },
];
const filters: DashboardFilters = { access: "all", sort: "score", query: "", provider: "" };

function entries(): LeaderboardEntry[] {
  return results.map((benchmark) => ({ model: models.find((model) => model.id === benchmark.model_id)!, benchmark, pricing: pricing.find((item) => item.model_id === benchmark.model_id) }));
}

describe("leaderboard ranking", () => {
  it("sorts benchmark scores descending", () => {
    expect(sortAndLimitEntries(entries(), "score").map((entry) => entry.model.name)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts all priced models by blended cost and keeps benchmark rank", () => {
    const sorted = sortAndLimitEntries(entries(), "cost-asc");
    expect(sorted.map((entry) => entry.model.name)).toEqual(["Beta", "Alpha"]);
    expect(sorted[0].benchmark.benchmark_rank).toBe(2);
  });

  it("excludes missing pricing only for cost sorting", () => {
    expect(sortAndLimitEntries(entries(), "cost-desc")).toHaveLength(2);
    expect(sortAndLimitEntries(entries(), "score")).toHaveLength(3);
  });
});

describe("global filters", () => {
  it("filters access type", () => {
    expect(filterEntries(entries(), { ...filters, access: "open" }).map((entry) => entry.model.name)).toEqual(["Beta", "Gamma"]);
  });

  it("searches model and provider", () => {
    expect(filterEntries(entries(), { ...filters, query: "closed co" })).toHaveLength(1);
    expect(filterEntries(entries(), { ...filters, query: "gamma" })[0].model.name).toBe("Gamma");
  });

  it("filters a selected provider", () => {
    expect(filterEntries(entries(), { ...filters, provider: "Open Co" })).toHaveLength(2);
  });
});

describe("leaderboard assembly", () => {
  it("joins models and pricing by canonical model id", () => {
    const built = buildLeaderboard("enterpriseops", models, results, pricing, filters);
    expect(built[0].model.id).toBe("closed:alpha");
    expect(built[0].pricing?.pricing_provider).toBe("Closed Co");
  });
});
