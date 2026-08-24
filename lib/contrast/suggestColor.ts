import { getContrastRatio } from "./contrastRatio";
import { mixRgb } from "./color";
import { getRelativeLuminance } from "./luminance";

/**
 * Suggest a foreground color that meets a WCAG contrast target against
 * a known background. The search mixes the original foreground toward
 * black or white (whichever increases contrast) and only returns a
 * color that mathematically meets the target.
 *
 * If neither direction can meet the target (rare for 4.5:1), returns
 * undefined rather than an inaccessible replacement.
 */
export function suggestAccessibleForeground(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
  targetRatio: number,
): { r: number; g: number; b: number } | undefined {
  if (
    getContrastRatio(foreground.r, foreground.g, foreground.b, background.r, background.g, background.b) >=
    targetRatio
  ) {
    return foreground;
  }

  const fgLum = getRelativeLuminance(foreground.r, foreground.g, foreground.b);
  const bgLum = getRelativeLuminance(background.r, background.g, background.b);
  const preferDarker = fgLum <= bgLum;
  const candidates: Array<{ r: number; g: number; b: number }> = [];

  const toward = preferDarker ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  const first = searchMix(foreground, toward, background, targetRatio);
  if (first) candidates.push(first);

  const opposite = preferDarker ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const second = searchMix(foreground, opposite, background, targetRatio);
  if (second) candidates.push(second);

  if (candidates.length === 0) return undefined;

  return candidates.reduce((best, current) => {
    const bestDist = distance(best, foreground);
    const currentDist = distance(current, foreground);
    return currentDist < bestDist ? current : best;
  });
}

function searchMix(
  from: { r: number; g: number; b: number },
  to: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
  targetRatio: number,
): { r: number; g: number; b: number } | undefined {
  const end = mixRgb(from, to, 1);
  if (getContrastRatio(end.r, end.g, end.b, background.r, background.g, background.b) < targetRatio) {
    return undefined;
  }

  let lo = 0;
  let hi = 1;
  let best: { r: number; g: number; b: number } | undefined;

  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const mixed = mixRgb(from, to, mid);
    const candidate = {
      r: Math.round(mixed.r),
      g: Math.round(mixed.g),
      b: Math.round(mixed.b),
    };
    const ratio = getContrastRatio(candidate.r, candidate.g, candidate.b, background.r, background.g, background.b);
    if (ratio >= targetRatio) {
      best = candidate;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  if (best) return best;

  const fallback = {
    r: Math.round(to.r),
    g: Math.round(to.g),
    b: Math.round(to.b),
  };
  if (getContrastRatio(fallback.r, fallback.g, fallback.b, background.r, background.g, background.b) >= targetRatio) {
    return fallback;
  }
  return undefined;
}

function distance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}
