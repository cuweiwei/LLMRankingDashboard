export const INPUT_WEIGHT = 0.75;
export const OUTPUT_WEIGHT = 0.25;

export function calculateBlendedCost(inputCost: number, outputCost: number): number {
  return inputCost * INPUT_WEIGHT + outputCost * OUTPUT_WEIGHT;
}

export function formatCost(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "N/A";
  return `$${value.toFixed(value < 1 ? 2 : 2)} / 1M`;
}
