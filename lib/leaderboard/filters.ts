import type { DashboardFilters, LeaderboardEntry } from "@/types/models";

export function filterEntries(entries: LeaderboardEntry[], filters: DashboardFilters): LeaderboardEntry[] {
  const query = filters.query.trim().toLowerCase();
  return entries.filter((entry) => {
    const accessMatch = filters.access === "all" || entry.model.model_access === filters.access;
    const providerMatch = !filters.provider || entry.model.provider === filters.provider;
    const queryMatch = !query || `${entry.model.name} ${entry.model.provider}`.toLowerCase().includes(query);
    return accessMatch && providerMatch && queryMatch;
  });
}
