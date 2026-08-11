import { describe, expect, it } from "vitest";
import { calculateBlendedCost } from "./cost";

describe("calculateBlendedCost", () => {
  it("weights input at 75% and output at 25%", () => {
    expect(calculateBlendedCost(1, 7)).toBe(2.5);
  });
});
