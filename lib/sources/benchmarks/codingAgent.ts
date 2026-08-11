import { fetchArtificialAnalysisModels, normalizeBenchmarkResults } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

export const codingAgentProvider: BenchmarkProvider = {
  id: "coding-agent-index",
  async fetch() {
    return normalizeBenchmarkResults(await fetchArtificialAnalysisModels(), "coding-agent-index", "artificial_analysis_coding_index");
  },
};
