import type { BenchmarkDefinition, DisplayEntry, SortMode } from "@/types/models";
import { formatCost } from "@/lib/utils/cost";

export default function UseCaseSummaryCard({ definition, entry, sort }: { definition: BenchmarkDefinition; entry?: DisplayEntry; sort: SortMode }) {
  const costSort = sort !== "score";
  return (
    <article className="summary-card">
      <div className="summary-topline">
        <span className="summary-index">0{definition.id === "enterpriseops" ? 1 : definition.id === "coding-agent-index" ? 2 : 3}</span>
        <span className="summary-label">{definition.displayName}</span>
        <span className="arrow-mark" aria-hidden="true">↗</span>
      </div>
      <div className="summary-main">
        {entry ? <>
          <h2>{entry.model.name}</h2>
          <p>{entry.model.provider}<span className="summary-divider">/</span>{entry.model.model_access === "open" ? "Open weight" : "Closed"}</p>
        </> : <h2 className="muted-text">No eligible model</h2>}
      </div>
      <div className="summary-bottom">
        <div><span className="meta-label">{costSort ? "Lowest cost" : "Benchmark rank"}</span><strong>{entry ? costSort ? formatCost(entry.pricing?.blended_cost_per_million_tokens) : `#${entry.benchmark.benchmark_rank}` : "—"}</strong></div>
        <div><span className="meta-label">Score</span><strong>{entry?.benchmark.score.toFixed(1) ?? "—"}</strong></div>
      </div>
    </article>
  );
}
