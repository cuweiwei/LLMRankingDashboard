import { SourceFetchError } from "@/lib/sources/artificialAnalysisApi";
import type { BenchmarkProvider } from "@/lib/sources/types";

export const enterpriseOpsProvider: BenchmarkProvider = {
  id: "enterpriseops",
  async fetch() {
    throw new SourceFetchError("EnterpriseOps-Gym-AA is not exposed as a distinct field in the free Artificial Analysis API");
  },
};
