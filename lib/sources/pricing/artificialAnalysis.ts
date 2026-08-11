import { fetchArtificialAnalysisModels, normalizePricing } from "@/lib/sources/artificialAnalysisApi";
import type { PricingProvider } from "@/lib/sources/types";

export const artificialAnalysisPricingProvider: PricingProvider = {
  id: "pricing",
  async fetch() {
    return normalizePricing(await fetchArtificialAnalysisModels());
  },
};
