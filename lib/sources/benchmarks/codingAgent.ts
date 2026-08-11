import { normalizeBenchmarkResults } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

export const codingAgentProvider: BenchmarkProvider = {
  id: "coding-agent-index",
  async fetch(context) {
    if (!context.artificialAnalysisRows) throw context.artificialAnalysisError ?? new Error("Artificial Analysis data is unavailable");
    return normalizeBenchmarkResults(context.artificialAnalysisRows, "coding-agent-index", ["artificial_analysis_coding_index"], context.models);
  },
};
