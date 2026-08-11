"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDashboardSnapshot } from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard/buildLeaderboard";
import type { BenchmarkId, DashboardFilters } from "@/types/models";
import DashboardHeader from "./DashboardHeader";
import GlobalFilters from "./GlobalFilters";
import UseCaseSummaryCard from "./UseCaseSummaryCard";
import LeaderboardSection from "./LeaderboardSection";
import Methodology from "./Methodology";

const snapshot = loadDashboardSnapshot();
const benchmarkIds: BenchmarkId[] = ["enterpriseops", "coding-agent-index", "gdpval"];
const defaultFilters: DashboardFilters = { access: "all", sort: "score", query: "", provider: "" };

function readFiltersFromUrl(): DashboardFilters {
  if (typeof window === "undefined") return defaultFilters;
  const params = new URLSearchParams(window.location.search);
  const access = params.get("access");
  const sort = params.get("sort");
  return {
    access: access === "open" || access === "closed" ? access : "all",
    sort: sort === "cost-asc" || sort === "cost-desc" ? sort : "score",
    query: params.get("q") ?? "",
    provider: params.get("provider") ?? "",
  };
}

function writeFiltersToUrl(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.access !== "all") params.set("access", filters.access);
  if (filters.sort !== "score") params.set("sort", filters.sort);
  if (filters.query) params.set("q", filters.query);
  if (filters.provider) params.set("provider", filters.provider);
  window.history.replaceState(null, "", params.toString() ? `/?${params.toString()}` : "/");
}

export default function DashboardApp() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(readFiltersFromUrl());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const providers = useMemo(() => [...new Set(snapshot.models.map((model) => model.provider))].sort(), []);
  const entriesByBenchmark = useMemo(() => {
    return Object.fromEntries(
      benchmarkIds.map((id) => [id, buildLeaderboard(id, snapshot.models, snapshot.benchmarks[id], snapshot.pricing, filters)]),
    ) as Record<BenchmarkId, ReturnType<typeof buildLeaderboard>>;
  }, [filters]);

  function updateFilters(next: Partial<DashboardFilters>) {
    const updated = { ...filters, ...next };
    setFilters(updated);
    writeFiltersToUrl(updated);
  }

  return (
    <main className="app-shell">
      <DashboardHeader lastUpdated={snapshot.lastUpdated} dataSource={snapshot.dataSource} metadata={snapshot.metadata} />
      <div className="content-shell">
        <section className="summary-grid" aria-label="Use case summaries">
          {benchmarkIds.map((id) => (
            <UseCaseSummaryCard key={id} definition={snapshot.definitions.find((item) => item.id === id)!} entry={entriesByBenchmark[id]?.[0]} sort={filters.sort} />
          ))}
        </section>

        <GlobalFilters filters={filters} providers={providers} onChange={updateFilters} />

        <div className="notice-row" aria-live="polite">
          <span className="seed-dot" aria-hidden="true" />
          <span>Illustrative seed dataset active.</span>
          <span className="notice-separator">·</span>
          <span>Static JSON snapshot</span>
          <span className="notice-separator">·</span>
          <span>Prices are standard API rates; cached, batch and self-hosting costs are excluded.</span>
        </div>

        <div className="leaderboards" aria-live="polite">
          {benchmarkIds.map((id) => {
            const definition = snapshot.definitions.find((item) => item.id === id)!;
            return (
              <LeaderboardSection
                key={id}
                definition={definition}
                entries={entriesByBenchmark[id] ?? []}
                loading={!ready}
                filters={filters}
                sourceStatus={snapshot.metadata.sources[id].status}
                updatedAt={snapshot.metadata.sources[id].last_successful_update ?? definition.updatedAt}
              />
            );
          })}
        </div>

        <Methodology definitions={snapshot.definitions} />
      </div>
      <footer className="site-footer">
        <span>LLM Frontier Dashboard</span>
        <span>Use-case rankings · Score scales are benchmark-specific</span>
      </footer>
    </main>
  );
}
