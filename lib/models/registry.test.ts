import { describe, expect, it } from "vitest";
import { mergeDiscoveredModels } from "./registry";
import type { AAModel } from "../sources/artificialAnalysisApi";
import type { Model } from "../../types/models";

const existing: Model[] = [
  { id: "anthropic:claude-opus-4.7", name: "Claude Opus 4.7", provider: "Anthropic", model_access: "closed" },
];

describe("model registry discovery", () => {
  it("adds an upstream model instead of discarding an unknown name", () => {
    const row: AAModel = {
      id: "upstream-fable-5",
      name: "Claude Fable 5",
      slug: "claude-fable-5",
      model_creator: { name: "Anthropic" },
      release_date: "2026-08-01",
    };

    const result = mergeDiscoveredModels(existing, [row]);

    expect(result.discovered).toHaveLength(1);
    expect(result.discovered[0]).toMatchObject({
      id: "anthropic:claude-fable-5",
      name: "Claude Fable 5",
      provider: "Anthropic",
      model_access: "unknown",
      upstream_id: "upstream-fable-5",
      upstream_slug: "claude-fable-5",
    });
  });

  it("keeps curated metadata when an upstream row matches an existing model", () => {
    const result = mergeDiscoveredModels(existing, [{
      id: "upstream-opus-47",
      name: "Claude Opus 4.7",
      slug: "claude-opus-4-7",
      model_creator: { name: "Anthropic" },
    }]);

    expect(result.discovered).toHaveLength(0);
    expect(result.models).toHaveLength(1);
    expect(result.models[0]).toMatchObject({
      id: "anthropic:claude-opus-4.7",
      model_access: "closed",
      upstream_id: "upstream-opus-47",
    });
  });
});
