import { describe, expect, it } from "vitest";
import { resolveCanonicalModelId } from "./aliases";

describe("model aliases", () => {
  it("resolves known aliases to canonical ids", () => {
    expect(resolveCanonicalModelId("OpenAI GPT-5.6")).toBe("openai:gpt-5.6");
    expect(resolveCanonicalModelId("claude-opus-4-7")).toBe("anthropic:claude-opus-4.7");
  });

  it("leaves unknown identifiers unchanged", () => {
    expect(resolveCanonicalModelId("vendor:unknown-model")).toBe("vendor:unknown-model");
  });
});
