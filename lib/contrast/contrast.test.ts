import { describe, expect, it } from "vitest";
import { getContrastRatio } from "./contrastRatio";
import { getRelativeLuminance, srgbChannelToLinear } from "./luminance";
import { suggestAccessibleForeground } from "./suggestColor";
import { evaluateContrast, WCAG_AA_NORMAL_TEXT } from "./wcag";
import { hexToRgb } from "./color";

describe("relative luminance", () => {
  it("returns 0 for black", () => {
    expect(getRelativeLuminance(0, 0, 0)).toBe(0);
  });

  it("returns 1 for white", () => {
    expect(getRelativeLuminance(255, 255, 255)).toBe(1);
  });

  it("linearizes sRGB using the WCAG piecewise function", () => {
    expect(srgbChannelToLinear(0)).toBe(0);
    expect(srgbChannelToLinear(10)).toBeCloseTo(10 / 255 / 12.92, 8);
    expect(srgbChannelToLinear(255)).toBeCloseTo(1, 8);
  });
});

describe("contrast ratio", () => {
  it("returns 21:1 for black on white", () => {
    expect(getContrastRatio(0, 0, 0, 255, 255, 255)).toBe(21);
  });

  it("returns 1:1 for identical colors", () => {
    expect(getContrastRatio(128, 128, 128, 128, 128, 128)).toBe(1);
  });

  it("is commutative", () => {
    const a = getContrastRatio(18, 18, 18, 255, 255, 255);
    const b = getContrastRatio(255, 255, 255, 18, 18, 18);
    expect(a).toBe(b);
  });

  it("does not round internally", () => {
    const ratio = getContrastRatio(118, 118, 118, 255, 255, 255);
    expect(ratio).not.toBe(Number(ratio.toFixed(1)));
    expect(ratio).toBeGreaterThan(4.5);
    expect(ratio).toBeLessThan(4.7);
  });
});

describe("WCAG evaluation", () => {
  it("marks black on white as meeting all thresholds", () => {
    const result = evaluateContrast(21);
    expect(result.meetsAaNormalText).toBe(true);
    expect(result.meetsAaaNormalText).toBe(true);
    expect(result.meetsAaUiComponent).toBe(true);
  });

  it("treats 4.5 as AA for normal text", () => {
    const result = evaluateContrast(4.5);
    expect(result.meetsAaNormalText).toBe(true);
    expect(result.meetsAaaNormalText).toBe(false);
  });
});

describe("accessible color suggestion", () => {
  it("returns a color that meets the target ratio", () => {
    const fg = hexToRgb("#8B8B8B");
    const bg = hexToRgb("#FFFFFF");
    const suggested = suggestAccessibleForeground(fg, bg, WCAG_AA_NORMAL_TEXT);
    expect(suggested).toBeDefined();
    if (!suggested) return;
    expect(getContrastRatio(suggested.r, suggested.g, suggested.b, bg.r, bg.g, bg.b)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL_TEXT,
    );
  });

  it("does not suggest an inaccessible replacement", () => {
    const fg = { r: 200, g: 200, b: 200 };
    const bg = { r: 255, g: 255, b: 255 };
    const suggested = suggestAccessibleForeground(fg, bg, WCAG_AA_NORMAL_TEXT);
    expect(suggested).toBeDefined();
    if (!suggested) return;
    expect(getContrastRatio(suggested.r, suggested.g, suggested.b, 255, 255, 255)).toBeGreaterThanOrEqual(4.5);
  });
});
