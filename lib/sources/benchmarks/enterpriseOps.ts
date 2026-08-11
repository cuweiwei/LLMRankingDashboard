import { SourceFetchError, normalizeBenchmarkResults, type AAModel } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

const ENTERPRISEOPS_SOURCE_URL = "https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa/";

async function fetchPermittedMachineReadableSource(url: string): Promise<AAModel[]> {
  const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new SourceFetchError(`EnterpriseOps source returned HTTP ${response.status}`);
  const body = (await response.json()) as unknown;
  const rows = Array.isArray(body) ? body : body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : [];
  if (!rows.length) throw new SourceFetchError("EnterpriseOps source returned no records");
  return rows.filter((item): item is AAModel => Boolean(item && typeof item === "object"));
}

export const enterpriseOpsProvider: BenchmarkProvider = {
  id: "enterpriseops",
  async fetch(context) {
    const apiResults = context.artificialAnalysisRows
      ? normalizeBenchmarkResults(
        context.artificialAnalysisRows,
        "enterpriseops",
        ["enterpriseops_gym_aa", "enterprise_ops_gym_aa", "enterpriseops_gym_aa_score"],
        context.models,
        ENTERPRISEOPS_SOURCE_URL,
      )
      : [];
    if (apiResults.length) return apiResults;

    const machineReadableUrl = process.env.ENTERPRISEOPS_SOURCE_URL;
    if (machineReadableUrl) {
      const rows = await fetchPermittedMachineReadableSource(machineReadableUrl);
      const results = normalizeBenchmarkResults(rows, "enterpriseops", ["enterpriseops_gym_aa", "score", "task_success_rate"], context.models, machineReadableUrl);
      if (results.length) return results;
      throw new SourceFetchError("ENTERPRISEOPS_SOURCE_URL returned records without recognizable scores");
    }

    throw new SourceFetchError(
      context.artificialAnalysisError instanceof Error
        ? `${context.artificialAnalysisError.message}; EnterpriseOps requires a permitted machine-readable source because the API response has no EnterpriseOps-Gym-AA field`
        : "EnterpriseOps-Gym-AA is not exposed as a distinct field; configure ENTERPRISEOPS_SOURCE_URL with a permitted JSON source",
    );
  },
};
