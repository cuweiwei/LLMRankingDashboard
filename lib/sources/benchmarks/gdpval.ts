import { fetchArtificialAnalysisModels, normalizeBenchmarkResults } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

export const gdpvalProvider: BenchmarkProvider = {
  id: "gdpval",
  async fetch() {
    return normalizeBenchmarkResults(await fetchArtificialAnalysisModels(), "gdpval", "gdpval_aa_elo");
  },
};
