export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AAA_NORMAL_TEXT = 7;
export const WCAG_AA_LARGE_TEXT = 3;
export const WCAG_AAA_LARGE_TEXT = 4.5;
export const WCAG_AA_UI_COMPONENT = 3;

export type WcagLevel = "AAA" | "AA" | "fail";

/**
 * Evaluate a measured contrast ratio against WCAG 2.2 thresholds.
 *
 * Screenshot analysis cannot reliably determine font size or whether a
 * region is text, so callers should treat this as a threshold lookup
 * rather than a compliance verdict.
 */
export function evaluateContrast(ratio: number): {
  meetsAaNormalText: boolean;
  meetsAaaNormalText: boolean;
  meetsAaLargeText: boolean;
  meetsAaaLargeText: boolean;
  meetsAaUiComponent: boolean;
} {
  return {
    meetsAaNormalText: ratio >= WCAG_AA_NORMAL_TEXT,
    meetsAaaNormalText: ratio >= WCAG_AAA_NORMAL_TEXT,
    meetsAaLargeText: ratio >= WCAG_AA_LARGE_TEXT,
    meetsAaaLargeText: ratio >= WCAG_AAA_LARGE_TEXT,
    meetsAaUiComponent: ratio >= WCAG_AA_UI_COMPONENT,
  };
}

export function requiredRatioForNormalText(preferAaa = false): number {
  return preferAaa ? WCAG_AAA_NORMAL_TEXT : WCAG_AA_NORMAL_TEXT;
}
