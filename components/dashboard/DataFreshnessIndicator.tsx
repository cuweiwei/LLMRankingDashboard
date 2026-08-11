import { isStale } from "@/lib/utils/dates";

export function DataFreshnessIndicator({ updatedAt, type }: { updatedAt?: string; type: "benchmark" | "pricing" }) {
  if (!updatedAt) return null;
  const stale = isStale(updatedAt, type === "benchmark" ? 7 : 14);
  return <span className={`freshness-indicator ${stale ? "stale" : ""}`} title={stale ? `${type === "benchmark" ? "Benchmark" : "Pricing"} data may be outdated` : undefined}>{stale ? "Data may be outdated" : `Checked ${new Date(updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}</span>;
}
