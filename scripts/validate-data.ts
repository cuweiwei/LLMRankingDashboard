import { readFile } from "node:fs/promises";
import path from "node:path";
import { benchmarkResultSchema, metadataSchema, modelSchema, pricingSchema } from "@/lib/validation/schemas";
import type { BenchmarkId, BenchmarkResult, Model, Pricing } from "@/types/models";

const root = process.cwd();

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, file), "utf8")) as T;
}

function fail(message: string): never {
  throw new Error(`[data:validate] ${message}`);
}

function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) fail(`${label} contains duplicates: ${[...new Set(duplicates)].join(", ")}`);
}

export async function validateDataFiles() {
  const models = await readJson<unknown[]>("data/models.json");
  const modelResult = modelSchema.array().safeParse(models);
  if (!modelResult.success) fail(`models.json failed schema validation: ${modelResult.error.message}`);
  const modelIds = (modelResult.data as Model[]).map((model) => model.id);
  assertUnique(modelIds, "model IDs");
  const modelIdSet = new Set(modelIds);

  const benchmarkFiles: Record<BenchmarkId, string> = {
    enterpriseops: "data/enterpriseops.json",
    "coding-agent-index": "data/coding.json",
    gdpval: "data/gdpval.json",
  };
  for (const [benchmarkId, file] of Object.entries(benchmarkFiles) as [BenchmarkId, string][]) {
    const records = await readJson<unknown[]>(file);
    const result = benchmarkResultSchema.array().safeParse(records);
    if (!result.success) fail(`${file} failed schema validation: ${result.error.message}`);
    const benchmarkRecords = result.data as BenchmarkResult[];
    if (benchmarkRecords.length < 3) fail(`${file} has suspiciously few records (${benchmarkRecords.length})`);
    if (benchmarkRecords.some((record) => record.benchmark_id !== benchmarkId)) fail(`${file} contains the wrong benchmark_id`);
    if (benchmarkRecords.some((record) => !modelIdSet.has(record.model_id))) fail(`${file} references an unknown model_id`);
    assertUnique(benchmarkRecords.map((record) => record.model_id), `${file} model IDs`);
    assertUnique(benchmarkRecords.map((record) => String(record.benchmark_rank)), `${file} ranks`);
  }

  const pricing = await readJson<unknown[]>("data/pricing.json");
  const pricingResult = pricingSchema.array().safeParse(pricing);
  if (!pricingResult.success) fail(`pricing.json failed schema validation: ${pricingResult.error.message}`);
  const pricingRecords = pricingResult.data as Pricing[];
  if (pricingRecords.some((record) => !modelIdSet.has(record.model_id))) fail("pricing.json references an unknown model_id");
  assertUnique(pricingRecords.map((record) => record.model_id), "pricing model IDs");

  const metadata = await readJson<unknown>("data/metadata.json");
  const metadataResult = metadataSchema.safeParse(metadata);
  if (!metadataResult.success) fail(`metadata.json failed schema validation: ${metadataResult.error.message}`);

  return { models: modelResult.data, pricing: pricingRecords };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateDataFiles().then(() => console.log("[data:validate] all data files are valid")).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
