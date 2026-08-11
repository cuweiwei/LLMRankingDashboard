import { normalizeBenchmarkResults } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

export const gdpvalProvider: BenchmarkProvider = {
  id: "gdpval",
  async fetch(context) {
    if (!context.artificialAnalysisRows) throw context.artificialAnalysisError ?? new Error("Artificial Analysis data is unavailable");
    return normalizeBenchmarkResults(context.artificialAnalysisRows, "gdpval", ["gdpval_aa_elo", "gdpval_aa_v2", "gdpval"], context.models);
  },
};
