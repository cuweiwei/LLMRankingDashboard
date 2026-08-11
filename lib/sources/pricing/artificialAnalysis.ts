import { normalizePricing } from "@/lib/sources/artificialAnalysisApi";
import type { PricingProvider } from "@/lib/sources/types";

export const artificialAnalysisPricingProvider: PricingProvider = {
  id: "pricing",
  async fetch(context) {
    if (!context.artificialAnalysisRows) throw context.artificialAnalysisError ?? new Error("Artificial Analysis data is unavailable");
    return normalizePricing(context.artificialAnalysisRows, context.models);
  },
};
