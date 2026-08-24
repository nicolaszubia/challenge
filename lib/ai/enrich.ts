import type { AccessibilityFinding } from "@/lib/types";
import type { AiExplanation } from "./types";

export async function enrichFindings(
  findings: AccessibilityFinding[],
): Promise<{ findings: AccessibilityFinding[]; aiUnavailable: boolean }> {
  if (findings.length === 0) {
    return { findings, aiUnavailable: false };
  }

  try {
    const response = await fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        findings: findings.map((finding) => ({
          id: finding.id,
          type: finding.type,
          contrastRatio: finding.contrastRatio,
          requiredRatio: finding.requiredRatio,
          foregroundColor: finding.foregroundColor,
          backgroundColor: finding.backgroundColor,
          severity: finding.severity,
        })),
      }),
    });

    if (!response.ok) {
      return { findings, aiUnavailable: true };
    }

    const data = (await response.json()) as { explanations?: AiExplanation[] };
    const byId = new Map((data.explanations ?? []).map((item) => [item.id, item]));

    return {
      aiUnavailable: false,
      findings: findings.map((finding) => {
        const extra = byId.get(finding.id);
        if (!extra) return finding;
        return {
          ...finding,
          whyItMatters: extra.whyItMatters,
          recommendation: extra.recommendation,
          source: "ai",
        };
      }),
    };
  } catch {
    return { findings, aiUnavailable: true };
  }
}
