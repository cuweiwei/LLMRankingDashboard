import type { BenchmarkDefinition, DashboardFilters, DisplayEntry } from "@/types/models";
import LeaderboardTable from "./LeaderboardTable";
import { DataFreshnessIndicator } from "./DataFreshnessIndicator";

export default function LeaderboardSection({ definition, entries, loading, filters }: { definition: BenchmarkDefinition; entries: DisplayEntry[]; loading: boolean; filters: DashboardFilters }) {
  return (
    <section className="leaderboard-section" aria-labelledby={`${definition.id}-heading`}>
      <div className="leaderboard-header">
        <div>
          <div className="section-kicker">{definition.displayName}</div>
          <h2 id={`${definition.id}-heading`}>{definition.benchmarkName}</h2>
          <p>{definition.subtitle}</p>
        </div>
        <div className="section-actions">
          <DataFreshnessIndicator updatedAt={definition.updatedAt} type="benchmark" />
          <a className="source-link" href={definition.sourceUrl} target="_blank" rel="noreferrer">Source <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <LeaderboardTable definition={definition} entries={entries} loading={loading} filters={filters} />
    </section>
  );
}
