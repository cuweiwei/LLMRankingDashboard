import { isStale } from "@/lib/utils/dates";
import type { SourceStatus } from "@/types/models";

export function DataFreshnessIndicator({ updatedAt, type, status }: { updatedAt?: string; type: "benchmark" | "pricing"; status?: SourceStatus }) {
  if (!updatedAt) return null;
  const stale = isStale(updatedAt, type === "benchmark" ? 7 : 14);
  const fallback = status === "fallback" || status === "failed";
  const label = status === "failed" ? "Refresh failed · cached" : fallback ? "Fallback snapshot" : stale ? "Data may be outdated" : `Checked ${new Date(updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  return <span className={`freshness-indicator ${stale || fallback ? "stale" : ""}`} title={stale || fallback ? `${type === "benchmark" ? "Benchmark" : "Pricing"} data may be outdated or using fallback data` : undefined}>{label}</span>;
}
