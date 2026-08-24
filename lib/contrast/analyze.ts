import type { AccessibilityFinding, BoundingBox, FindingSeverity } from "@/lib/types";
import { rgbToHex } from "./color";
import { getContrastRatio } from "./contrastRatio";
import { getRelativeLuminance } from "./luminance";
import { suggestAccessibleForeground } from "./suggestColor";
import { WCAG_AA_NORMAL_TEXT, WCAG_AA_UI_COMPONENT } from "./wcag";
import { applyFallbackCopy } from "@/lib/ai/fallbackRecommendations";

const ANALYSIS_MAX_WIDTH = 720;
const WINDOW_SIZE = 22;
const STEP = 11;
const MIN_CLUSTER_SHARE = 0.2;
const MIN_LUMINANCE_STDDEV = 0.028;
const MAX_FINDINGS = 18;

type RawCandidate = {
  bounds: BoundingBox;
  contrastRatio: number;
  foreground: { r: number; g: number; b: number };
  background: { r: number; g: number; b: number };
};

/**
 * Screenshot contrast analysis.
 *
 * Spectra inspects pixels, not DOM nodes. It cannot know font size,
 * semantic role, or whether a region is text. Findings are therefore
 * reported as potential low-contrast regions, not WCAG failures.
 *
 * Method: slide a window across a downscaled copy of the image, split
 * each window into darker/lighter luminance groups, and record pairs
 * whose WCAG contrast ratio is below 4.5:1. Nearby similar detections
 * are merged. Coordinates are mapped back to the source image.
 */
export function analyzeContrast(source: ImageData): AccessibilityFinding[] {
  const scale = Math.min(1, ANALYSIS_MAX_WIDTH / source.width);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const sampled = scale === 1 ? source : downsample(source, width, height);
  const candidates = collectCandidates(sampled);
  const merged = mergeCandidates(candidates);
  const ranked = merged.sort((a, b) => a.contrastRatio - b.contrastRatio).slice(0, MAX_FINDINGS);

  return ranked.map((candidate, index) => {
    const severity: FindingSeverity = candidate.contrastRatio < WCAG_AA_UI_COMPONENT ? "high" : "medium";
    const suggested = suggestAccessibleForeground(
      candidate.foreground,
      candidate.background,
      WCAG_AA_NORMAL_TEXT,
    );
    const suggestedHex =
      suggested &&
      getContrastRatio(
        suggested.r,
        suggested.g,
        suggested.b,
        candidate.background.r,
        candidate.background.g,
        candidate.background.b,
      ) >= WCAG_AA_NORMAL_TEXT
        ? rgbToHex(suggested.r, suggested.g, suggested.b)
        : undefined;

    return applyFallbackCopy({
      id: `contrast-${index + 1}`,
      type: "contrast",
      title: "Potential low contrast",
      severity,
      contrastRatio: candidate.contrastRatio,
      requiredRatio: WCAG_AA_NORMAL_TEXT,
      foregroundColor: rgbToHex(candidate.foreground.r, candidate.foreground.g, candidate.foreground.b),
      backgroundColor: rgbToHex(candidate.background.r, candidate.background.g, candidate.background.b),
      suggestedForegroundColor: suggestedHex,
      bounds: {
        x: candidate.bounds.x / scale,
        y: candidate.bounds.y / scale,
        width: candidate.bounds.width / scale,
        height: candidate.bounds.height / scale,
      },
    });
  });
}

function collectCandidates(image: ImageData): RawCandidate[] {
  const { width, height, data } = image;
  const candidates: RawCandidate[] = [];
  const maxX = Math.max(0, width - WINDOW_SIZE);
  const maxY = Math.max(0, height - WINDOW_SIZE);

  for (let y = 0; y <= maxY; y += STEP) {
    for (let x = 0; x <= maxX; x += STEP) {
      const candidate = inspectWindow(data, width, x, y, WINDOW_SIZE);
      if (candidate) candidates.push(candidate);
    }
  }

  return candidates;
}

function inspectWindow(
  data: Uint8ClampedArray,
  imageWidth: number,
  originX: number,
  originY: number,
  size: number,
): RawCandidate | null {
  const luminances: number[] = [];
  const pixels: Array<{ r: number; g: number; b: number; l: number }> = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = ((originY + y) * imageWidth + (originX + x)) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const l = getRelativeLuminance(r, g, b);
      luminances.push(l);
      pixels.push({ r, g, b, l });
    }
  }

  const mean = luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
  const variance = luminances.reduce((sum, value) => sum + (value - mean) ** 2, 0) / luminances.length;
  if (Math.sqrt(variance) < MIN_LUMINANCE_STDDEV) return null;

  const sorted = [...luminances].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const dark = pixels.filter((pixel) => pixel.l <= median);
  const light = pixels.filter((pixel) => pixel.l > median);
  const minCount = pixels.length * MIN_CLUSTER_SHARE;
  if (dark.length < minCount || light.length < minCount) return null;

  const darkMean = meanColor(dark);
  const lightMean = meanColor(light);
  const ratio = getContrastRatio(darkMean.r, darkMean.g, darkMean.b, lightMean.r, lightMean.g, lightMean.b);
  if (ratio >= WCAG_AA_NORMAL_TEXT) return null;

  const darkShare = dark.length / pixels.length;
  const foreground = darkShare <= 0.5 ? darkMean : lightMean;
  const background = darkShare <= 0.5 ? lightMean : darkMean;

  return {
    bounds: { x: originX, y: originY, width: size, height: size },
    contrastRatio: ratio,
    foreground,
    background,
  };
}

function meanColor(pixels: Array<{ r: number; g: number; b: number }>): { r: number; g: number; b: number } {
  const total = pixels.reduce(
    (acc, pixel) => {
      acc.r += pixel.r;
      acc.g += pixel.g;
      acc.b += pixel.b;
      return acc;
    },
    { r: 0, g: 0, b: 0 },
  );
  return {
    r: Math.round(total.r / pixels.length),
    g: Math.round(total.g / pixels.length),
    b: Math.round(total.b / pixels.length),
  };
}

function mergeCandidates(candidates: RawCandidate[]): RawCandidate[] {
  const remaining = [...candidates];
  const merged: RawCandidate[] = [];

  while (remaining.length > 0) {
    const current = remaining.shift();
    if (!current) break;
    let acc = current;
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        const other = remaining[i];
        if (shouldMerge(acc, other)) {
          acc = combine(acc, other);
          remaining.splice(i, 1);
          changed = true;
        }
      }
    }
    merged.push(acc);
  }

  return merged;
}

function shouldMerge(a: RawCandidate, b: RawCandidate): boolean {
  if (iou(a.bounds, b.bounds) < 0.08 && !nearby(a.bounds, b.bounds, 18)) return false;
  const colorDelta =
    channelDelta(a.foreground, b.foreground) + channelDelta(a.background, b.background);
  return colorDelta < 90;
}

function combine(a: RawCandidate, b: RawCandidate): RawCandidate {
  const lower = a.contrastRatio <= b.contrastRatio ? a : b;
  return {
    ...lower,
    bounds: union(a.bounds, b.bounds),
  };
}

function union(a: BoundingBox, b: BoundingBox): BoundingBox {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function iou(a: BoundingBox, b: BoundingBox): number {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.width, b.x + b.width) - x;
  const h = Math.min(a.y + a.height, b.y + b.height) - y;
  if (w <= 0 || h <= 0) return 0;
  const intersection = w * h;
  const area = a.width * a.height + b.width * b.height - intersection;
  return intersection / area;
}

function nearby(a: BoundingBox, b: BoundingBox, gap: number): boolean {
  const expanded: BoundingBox = {
    x: a.x - gap,
    y: a.y - gap,
    width: a.width + gap * 2,
    height: a.height + gap * 2,
  };
  return iou(expanded, b) > 0;
}

function channelDelta(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function downsample(source: ImageData, width: number, height: number): ImageData {
  const result = new ImageData(width, height);
  const xRatio = source.width / width;
  const yRatio = source.height / height;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(source.width - 1, Math.floor(x * xRatio));
      const sy = Math.min(source.height - 1, Math.floor(y * yRatio));
      const srcIdx = (sy * source.width + sx) * 4;
      const dstIdx = (y * width + x) * 4;
      result.data[dstIdx] = source.data[srcIdx];
      result.data[dstIdx + 1] = source.data[srcIdx + 1];
      result.data[dstIdx + 2] = source.data[srcIdx + 2];
      result.data[dstIdx + 3] = source.data[srcIdx + 3];
    }
  }
  return result;
}
