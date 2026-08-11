import { formatDateTime } from "@/lib/utils/dates";
import type { DataMetadata, DataSource } from "@/types/models";

export default function DashboardHeader({ lastUpdated, dataSource, metadata }: { lastUpdated: string; dataSource: DataSource; metadata: DataMetadata }) {
  const statuses = Object.values(metadata.sources).map((source) => source.status);
  const hasFailure = statuses.includes("failed");
  const hasFallback = statuses.includes("fallback");
  const statusLabel = hasFailure ? "Refresh failed · cached" : hasFallback || dataSource === "seed" ? "DEMO / FALLBACK DATA" : "Live data";
  return (
    <header className="dashboard-header content-shell">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
        <div>
          <p className="eyebrow">Operational model intelligence</p>
          <h1>LLM Frontier Dashboard</h1>
        </div>
      </div>
      <div className="header-meta">
        <span className={`status-chip ${hasFailure || hasFallback || dataSource === "seed" ? "status-seed" : "status-live"}`}>
          <span className="status-dot" aria-hidden="true" /> {statusLabel}
        </span>
        <div className="updated-block">
          <span className="meta-label">Last updated</span>
          <time dateTime={lastUpdated}>{formatDateTime(lastUpdated)}</time>
        </div>
      </div>
      <div className="header-copy">
        <p>Find the best models for how you actually use AI.</p>
        <span>Three practical frontiers. One transparent view of score, access and cost.</span>
      </div>
    </header>
  );
}
