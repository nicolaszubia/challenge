import { getRelativeLuminance } from "./luminance";

/**
 * WCAG contrast ratio.
 *
 * Source: WCAG 2.2 Success Criterion 1.4.3
 * https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
 *
 * (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter relative luminance and L2 is the darker.
 *
 * Range is 1:1 to 21:1. Rounding is applied only at the display layer.
 */
export function getContrastRatio(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const l1 = getRelativeLuminance(r1, g1, b1);
  const l2 = getRelativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatContrastRatio(ratio: number, digits = 1): string {
  return `${ratio.toFixed(digits)}:1`;
}
