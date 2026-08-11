import type { BenchmarkDefinition, BenchmarkId } from "@/types/models";

export const benchmarkDefinitions: BenchmarkDefinition[] = [
  {
    id: "enterpriseops",
    displayName: "Personal Agent",
    benchmarkName: "EnterpriseOps-Gym-AA",
    subtitle: "Multi-step enterprise agent tasks, tool use, workflow execution and reliability.",
    sourceUrl: "https://artificialanalysis.ai/evaluations/enterprise-ops-gym-aa/",
    updatedAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "coding-agent-index",
    displayName: "Coding",
    benchmarkName: "Artificial Analysis Coding Agent Index",
    subtitle: "End-to-end software engineering, repository understanding, terminal use, implementation and debugging.",
    sourceUrl: "https://artificialanalysis.ai/agents/coding-agents/",
    updatedAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "gdpval",
    displayName: "Knowledge Work",
    benchmarkName: "GDPval-AA v2",
    subtitle: "Research, analysis and professional deliverables including documents, presentations and spreadsheets.",
    sourceUrl: "https://artificialanalysis.ai/evaluations/gdpval-aa",
    updatedAt: "2026-08-10T09:00:00.000Z",
  },
];

export function getBenchmarkDefinition(id: BenchmarkId): BenchmarkDefinition {
  return benchmarkDefinitions.find((definition) => definition.id === id) ?? benchmarkDefinitions[0];
}
