import { describe, expect, it } from "vitest";
import { fallbackRecommendation, fallbackWhyItMatters } from "./fallbackRecommendations";

describe("deterministic fallback copy", () => {
  it("mentions the 3:1 threshold for very low contrast", () => {
    expect(fallbackWhyItMatters(2.4, 4.5)).toContain("3:1");
  });

  it("mentions the expected ratio for mid-range contrast", () => {
    expect(fallbackWhyItMatters(3.6, 4.5)).toContain("4.5:1");
  });

  it("points to a verified color when one exists", () => {
    expect(fallbackRecommendation(true)).toContain("verified");
  });
});
