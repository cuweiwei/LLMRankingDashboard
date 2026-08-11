import type { Pricing } from "@/types/models";
import { formatCost, INPUT_WEIGHT, OUTPUT_WEIGHT } from "@/lib/utils/cost";
import { DataFreshnessIndicator } from "./DataFreshnessIndicator";

export function CostDisplay({ pricing }: { pricing?: Pricing }) {
  if (pricing?.blended_cost_per_million_tokens === undefined) return <span className="na-value">N/A</span>;
  return (
    <details className="pricing-details">
      <summary>{formatCost(pricing.blended_cost_per_million_tokens)} <span aria-hidden="true">⌄</span></summary>
      <div className="pricing-popover">
        <div className="pricing-line"><span>Input</span><strong>${pricing.input_cost_per_million_tokens?.toFixed(2)} / 1M</strong></div>
        <div className="pricing-line"><span>Output</span><strong>${pricing.output_cost_per_million_tokens?.toFixed(2)} / 1M</strong></div>
        <div className="pricing-line blended"><span>Blended</span><strong>{formatCost(pricing.blended_cost_per_million_tokens)}</strong></div>
        <p>Assumption: {INPUT_WEIGHT * 100}% input + {OUTPUT_WEIGHT * 100}% output.</p>
        <span className="pricing-provider">via {pricing.pricing_provider}</span>
        <a href={pricing.source_url} target="_blank" rel="noreferrer">Pricing source ↗</a>
        <DataFreshnessIndicator updatedAt={pricing.pricing_checked_at} type="pricing" />
      </div>
    </details>
  );
}
