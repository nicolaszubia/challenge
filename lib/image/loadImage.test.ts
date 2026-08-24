import { describe, expect, it } from "vitest";
import { workingDimensions } from "./loadImage";

describe("workingDimensions", () => {
  it("keeps typical screenshots unchanged", () => {
    expect(workingDimensions(1440, 900)).toEqual({ width: 1440, height: 900, resized: false });
  });

  it("downscales images that exceed the working pixel budget", () => {
    const result = workingDimensions(6000, 4000);
    expect(result.resized).toBe(true);
    expect(result.width * result.height).toBeLessThanOrEqual(3_500_000);
  });

  it("rejects images that are too small", () => {
    expect(() => workingDimensions(4, 4)).toThrow("too small");
  });
});
