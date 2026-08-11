import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { enterpriseOpsProvider } from "@/lib/sources/benchmarks/enterpriseOps";
import { codingAgentProvider } from "@/lib/sources/benchmarks/codingAgent";
import { gdpvalProvider } from "@/lib/sources/benchmarks/gdpval";
import { artificialAnalysisPricingProvider } from "@/lib/sources/pricing/artificialAnalysis";
import { fetchArtificialAnalysisModels, type AAModel } from "@/lib/sources/artificialAnalysisApi";
import { mergeDiscoveredModels } from "@/lib/models/registry";
import { benchmarkResultSchema, metadataSchema, pricingSchema } from "@/lib/validation/schemas";
import type { BenchmarkId, DataMetadata, Model, Pricing, SourceRefreshStatus } from "@/types/models";
import type { SourceContext } from "@/lib/sources/types";
import { validateDataFiles } from "./validate-data";

const root = process.cwd();
const now = new Date().toISOString();

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, file), "utf8")) as T;
}

async function writeAtomic(file: string, value: unknown) {
  const target = path.join(root, file);
  const temporary = `${target}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, target);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message.replace(/x-api-key[^\s]*/gi, "x-api-key") : "Unknown source error";
}

function assertCandidateCount(source: string, currentCount: number, candidateCount: number) {
  const minimum = Math.max(3, Math.floor(currentCount * 0.5));
  if (candidateCount < minimum) throw new Error(`${source} returned ${candidateCount} records; refusing to replace ${currentCount} existing records`);
}

async function updateBenchmark(benchmarkId: BenchmarkId, file: string, currentMetadata: SourceRefreshStatus, context: SourceContext) {
  const existing = await readJson<unknown[]>(file);
  try {
    const provider = benchmarkId === "enterpriseops" ? enterpriseOpsProvider : benchmarkId === "gdpval" ? gdpvalProvider : codingAgentProvider;
    const candidate = await provider.fetch(context);
    const parsed = benchmarkResultSchema.array().safeParse(candidate);
    if (!parsed.success) throw new Error(`${benchmarkId} candidate failed validation: ${parsed.error.message}`);
    assertCandidateCount(benchmarkId, existing.length, parsed.data.length);
    await writeAtomic(file, parsed.data);
    console.log(`${benchmarkId}: SUCCESS (${parsed.data.length} records)`);
    return { last_attempted_update: now, last_successful_update: now, status: "success" as const, record_count: parsed.data.length };
  } catch (error) {
    console.log(`${benchmarkId}: FALLBACK (${errorMessage(error)})`);
    return { ...currentMetadata, last_attempted_update: now, status: "fallback" as const, error: errorMessage(error), record_count: existing.length };
  }
}

async function updatePricing(currentMetadata: SourceRefreshStatus, context: SourceContext) {
  const file = "data/pricing.json";
  const existing = await readJson<Pricing[]>(file);
  try {
    const candidate = await artificialAnalysisPricingProvider.fetch(context);
    const parsed = pricingSchema.array().safeParse(candidate);
    if (!parsed.success) throw new Error(`pricing candidate failed validation: ${parsed.error.message}`);
    assertCandidateCount("pricing", existing.length, parsed.data.length);
    await writeAtomic(file, parsed.data);
    console.log(`pricing: SUCCESS (${parsed.data.length} records)`);
    return { last_attempted_update: now, last_successful_update: now, status: "success" as const, record_count: parsed.data.length };
  } catch (error) {
    console.log(`pricing: FALLBACK (${errorMessage(error)})`);
    return { ...currentMetadata, last_attempted_update: now, status: "fallback" as const, error: errorMessage(error), record_count: existing.length };
  }
}

export async function updateData() {
  const existingModels = await readJson<Model[]>("data/models.json");
  let discoveredRows: AAModel[] | undefined;
  let artificialAnalysisError: unknown;
  try {
    discoveredRows = await fetchArtificialAnalysisModels();
    const registry = mergeDiscoveredModels(existingModels, discoveredRows);
    await writeAtomic("data/models.json", registry.models);
    console.log(`models: SUCCESS (${registry.models.length} total, ${registry.discovered.length} newly discovered)`);
  } catch (error) {
    artificialAnalysisError = error;
    console.log(`models: FALLBACK (${errorMessage(error)})`);
  }
  const context: SourceContext = { models: discoveredRows ? mergeDiscoveredModels(existingModels, discoveredRows).models : existingModels, artificialAnalysisRows: discoveredRows, artificialAnalysisError };
  const metadata = await readJson<DataMetadata>("data/metadata.json");
  const nextMetadata: DataMetadata = {
    generated_at: now,
    sources: {
      enterpriseops: await updateBenchmark("enterpriseops", "data/enterpriseops.json", metadata.sources.enterpriseops, context),
      "coding-agent-index": await updateBenchmark("coding-agent-index", "data/coding.json", metadata.sources["coding-agent-index"], context),
      gdpval: await updateBenchmark("gdpval", "data/gdpval.json", metadata.sources.gdpval, context),
      pricing: await updatePricing(metadata.sources.pricing, context),
    },
  };
  const parsedMetadata = metadataSchema.safeParse(nextMetadata);
  if (!parsedMetadata.success) throw new Error(`metadata failed validation: ${parsedMetadata.error.message}`);
  await writeAtomic("data/metadata.json", parsedMetadata.data);
  await validateDataFiles();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateData().then(() => console.log("[data:update] completed with validated live/fallback records")).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
