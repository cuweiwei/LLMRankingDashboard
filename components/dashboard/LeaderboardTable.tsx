import type { BenchmarkDefinition, DashboardFilters, DisplayEntry } from "@/types/models";
import { CostDisplay } from "./PricingPopover";
import ModelAccessBadge from "./ModelAccessBadge";
import { formatDateOnly } from "@/lib/utils/dates";

function SkeletonRows() {
  return <>{Array.from({ length: 5 }).map((_, index) => <div className="skeleton-row" key={index}><span /><span /><span /><span /><span /><span /></div>)}</>;
}

export default function LeaderboardTable({ definition, entries, loading, filters }: { definition: BenchmarkDefinition; entries: DisplayEntry[]; loading: boolean; filters: DashboardFilters }) {
  const costSort = filters.sort !== "score";
  return (
    <div className="table-frame">
      <div className="table-toolbar">
        <span>{costSort ? "Showing 10 eligible models by cost" : "Top 10 by benchmark score"}</span>
        {costSort && <span className="toolbar-note">Rank column keeps original benchmark position</span>}
      </div>
      <div className="leaderboard-table" role="table" aria-label={`${definition.displayName} leaderboard`}>
        <div className="table-row table-head" role="row">
          <span role="columnheader">Rank</span><span role="columnheader">Model</span><span role="columnheader">Provider</span><span role="columnheader">Score</span><span role="columnheader">Access</span><span role="columnheader">Blended cost</span>
        </div>
        {loading ? <SkeletonRows /> : entries.length === 0 ? <div className="empty-state"><strong>No eligible models found</strong><span>Try clearing a filter or choosing All models.</span></div> : entries.map((entry) => <LeaderboardRow key={entry.model.id} entry={entry} costSort={costSort} />)}
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, costSort }: { entry: DisplayEntry; costSort: boolean }) {
  return (
    <div className={`table-row model-row ${entry.displayPosition <= 3 ? "top-row" : ""}`} role="row">
      <div className="rank-cell" role="cell"><span className="rank-number">{costSort ? `#${entry.benchmark.benchmark_rank}` : entry.displayPosition}</span>{costSort && entry.displayPosition === 1 && <span className="cheapest-badge">Cheapest</span>}</div>
      <div className="model-cell" role="cell"><strong>{entry.model.name}</strong><span>{entry.model.configuration}</span></div>
      <span className="provider-cell" role="cell">{entry.model.provider}</span>
      <div className="score-cell" role="cell"><strong>{entry.benchmark.score.toFixed(1)}</strong><span className="score-bar" aria-hidden="true"><span style={{ width: `${Math.max(5, Math.min(100, entry.benchmark.score))}%` }} /></span></div>
      <div role="cell"><ModelAccessBadge access={entry.model.model_access} /></div>
      <div className="cost-cell" role="cell"><CostDisplay pricing={entry.pricing} /></div>
      <details className="row-details"><summary aria-label={`More details for ${entry.model.name}`}>i</summary><div className="details-popover"><span>Benchmark rank: #{entry.benchmark.benchmark_rank}</span><span>Benchmark score: {entry.benchmark.score.toFixed(1)}</span><span>Benchmark updated: {formatDateOnly(entry.benchmark.benchmark_updated_at)}</span><span>Pricing provider: {entry.pricing?.pricing_provider ?? "Unavailable"}</span><a href={entry.benchmark.source_url} target="_blank" rel="noreferrer">Benchmark source ↗</a>{entry.pricing && <a href={entry.pricing.source_url} target="_blank" rel="noreferrer">Pricing source ↗</a>}</div></details>
    </div>
  );
}
