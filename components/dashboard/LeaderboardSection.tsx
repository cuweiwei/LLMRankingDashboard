import type { BenchmarkDefinition, DashboardFilters, DisplayEntry, SourceStatus } from "@/types/models";
import LeaderboardTable from "./LeaderboardTable";
import { DataFreshnessIndicator } from "./DataFreshnessIndicator";

export default function LeaderboardSection({ definition, entries, loading, filters, sourceStatus, updatedAt }: { definition: BenchmarkDefinition; entries: DisplayEntry[]; loading: boolean; filters: DashboardFilters; sourceStatus: SourceStatus; updatedAt: string }) {
  return (
    <section className="leaderboard-section" aria-labelledby={`${definition.id}-heading`}>
      <div className="leaderboard-header">
        <div>
          <div className="section-kicker">{definition.displayName}</div>
          <h2 id={`${definition.id}-heading`}>{definition.benchmarkName}</h2>
          <p>{definition.subtitle}</p>
        </div>
        <div className="section-actions">
          <DataFreshnessIndicator updatedAt={updatedAt} type="benchmark" status={sourceStatus} />
          <a className="source-link" href={definition.sourceUrl} target="_blank" rel="noreferrer">Source <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <LeaderboardTable definition={definition} entries={entries} loading={loading} filters={filters} />
    </section>
  );
}
