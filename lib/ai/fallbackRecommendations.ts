import type { AccessibilityFinding } from "@/lib/types";
import { formatContrastRatio } from "@/lib/contrast/contrastRatio";

export function fallbackWhyItMatters(ratio: number, requiredRatio: number): string {
  if (ratio < 3) {
    return "This region may be difficult to distinguish for many people, including users with reduced contrast sensitivity. The measured contrast is below the 3:1 threshold typically used for large text and user interface components.";
  }
  return `This region may be difficult to read as normal-sized text. The measured contrast is below the ${formatContrastRatio(requiredRatio, 1)} WCAG AA recommendation for regular text.`;
}

export function fallbackRecommendation(hasSuggestion: boolean): string {
  if (hasSuggestion) {
    return "Increase the contrast between the foreground and background. A verified alternative foreground color is provided below.";
  }
  return "Increase the contrast between the foreground and background. Darken or lighten the foreground, or choose a more distinct background.";
}

export function applyFallbackCopy(
  finding: Omit<AccessibilityFinding, "whyItMatters" | "recommendation" | "source"> & {
    whyItMatters?: string;
    recommendation?: string;
    source?: AccessibilityFinding["source"];
  },
): AccessibilityFinding {
  return {
    ...finding,
    whyItMatters: finding.whyItMatters ?? fallbackWhyItMatters(finding.contrastRatio, finding.requiredRatio),
    recommendation: finding.recommendation ?? fallbackRecommendation(Boolean(finding.suggestedForegroundColor)),
    source: finding.source ?? "deterministic",
  };
}
