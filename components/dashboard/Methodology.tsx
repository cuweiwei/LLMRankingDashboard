import type { BenchmarkDefinition } from "@/types/models";

export default function Methodology({ definitions }: { definitions: BenchmarkDefinition[] }) {
  return (
    <details className="methodology">
      <summary><span><span className="section-kicker">Transparency</span><strong>Methodology & data sources</strong></span><span className="methodology-caret" aria-hidden="true">⌄</span></summary>
      <div className="methodology-body">
        <div className="methodology-grid">
          <div><h3>Benchmarks</h3><p><strong>Personal Agent</strong> uses EnterpriseOps-Gym-AA for multi-step enterprise workflows, tool use and agent reliability.</p><p><strong>Coding</strong> uses the Coding Agent Index for end-to-end software engineering rather than isolated coding questions.</p><p><strong>Knowledge Work</strong> uses GDPval-AA v2 for professional research, analysis, documents, presentations and spreadsheets.</p></div>
          <div><h3>Cost model</h3><p>Blended Cost = 75% input price + 25% output price, shown per 1M tokens. This is a comparison assumption, not an official benchmark metric.</p><p>Open-weight entries use a reliable hosted API price when available. Self-hosting GPU costs are never estimated; unavailable pricing is excluded only from cost sorting.</p></div>
          <div><h3>Data status</h3><p>Bundled rows are validated seed records designed to keep the app runnable offline. The adapter boundary is ready for a stable public feed and separate pricing refreshers.</p><div className="methodology-sources">{definitions.map((definition) => <a key={definition.id} href={definition.sourceUrl} target="_blank" rel="noreferrer">{definition.benchmarkName} ↗</a>)}</div></div>
        </div>
      </div>
    </details>
  );
}
