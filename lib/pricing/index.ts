import type { Model, Pricing } from "@/types/models";

/** Pricing providers stay separate from benchmark adapters so hosted prices can be refreshed independently. */
export async function fetchPricing(_models: Model[]): Promise<Pricing[]> {
  void _models;
  return [];
}
