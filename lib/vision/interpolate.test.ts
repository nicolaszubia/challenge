import { describe, expect, it } from "vitest";
import { IDENTITY_MATRIX, lerpMatrix, matrixForSeverity, getProtanopiaMatrix } from "./matrices";

describe("simulation interpolation", () => {
  it("returns identity at 0 intensity", () => {
    const matrix = getProtanopiaMatrix(0);
    expect(matrix).toEqual(IDENTITY_MATRIX);
  });

  it("returns the dichromacy matrix at 100% intensity", () => {
    const matrix = getProtanopiaMatrix(1);
    expect(matrix[0][0]).toBeCloseTo(0.152286, 6);
    expect(matrix[1][1]).toBeCloseTo(0.786281, 6);
  });

  it("lerps matrices channel by channel", () => {
    const a = IDENTITY_MATRIX;
    const b: typeof IDENTITY_MATRIX = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ];
    const mid = lerpMatrix(a, b, 0.5);
    expect(mid[0][0]).toBeCloseTo(0.5);
    expect(mid[0][1]).toBeCloseTo(0.5);
  });

  it("interpolates between Machado severity tables", () => {
    const tables = [
      [
        [0.8, 0.2, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [
        [0.6, 0.4, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    ] as const;
    const padded = [...tables, ...Array.from({ length: 8 }, () => tables[1])];
    const matrix = matrixForSeverity(padded, 0.05);
    expect(matrix[0][0]).toBeCloseTo(0.9, 5);
  });
});
