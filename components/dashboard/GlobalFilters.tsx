import type { DashboardFilters, SortMode } from "@/types/models";

export default function GlobalFilters({
  filters,
  providers,
  onChange,
}: {
  filters: DashboardFilters;
  providers: string[];
  onChange: (next: Partial<DashboardFilters>) => void;
}) {
  const sortOptions: { value: SortMode; label: string }[] = [
    { value: "score", label: "Benchmark Score" },
    { value: "cost-asc", label: "Cost: Low → High" },
    { value: "cost-desc", label: "Cost: High → Low" },
  ];

  return (
    <section className="filters-panel" aria-label="Global filters">
      <div className="filter-heading">
        <span className="section-kicker">Explore the frontier</span>
        <span className="filter-count">Applied globally across all three boards</span>
      </div>
      <div className="filter-controls">
        <fieldset className="segmented-control">
          <legend>Model access</legend>
          {["all", "open", "closed"].map((access) => (
            <button
              key={access}
              type="button"
              className={filters.access === access ? "segment active" : "segment"}
              aria-pressed={filters.access === access}
              onClick={() => onChange({ access: access as DashboardFilters["access"] })}
            >
              {access === "all" ? "All models" : access[0].toUpperCase() + access.slice(1)}
            </button>
          ))}
        </fieldset>

        <label className="select-field">
          <span>Sort by</span>
          <select value={filters.sort} onChange={(event) => onChange({ sort: event.target.value as SortMode })}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="select-field provider-field">
          <span>Provider</span>
          <select value={filters.provider} onChange={(event) => onChange({ provider: event.target.value })}>
            <option value="">All providers</option>
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
        </label>

        <label className="search-field">
          <span className="sr-only">Search models or providers</span>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search models or providers"
            type="search"
          />
          {filters.query && <button className="clear-search" type="button" onClick={() => onChange({ query: "" })} aria-label="Clear search">×</button>}
        </label>
      </div>
    </section>
  );
}
