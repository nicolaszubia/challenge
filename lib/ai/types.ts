export type AiExplanation = {
  id: string;
  whyItMatters: string;
  recommendation: string;
};

export type AiFindingPayload = {
  id: string;
  type: "contrast";
  contrastRatio: number;
  requiredRatio: number;
  foregroundColor: string;
  backgroundColor: string;
  severity: "high" | "medium";
};

export function isAiExplanation(value: unknown): value is AiExplanation {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.whyItMatters === "string" &&
    typeof record.recommendation === "string" &&
    record.whyItMatters.trim().length > 0 &&
    record.recommendation.trim().length > 0 &&
    record.whyItMatters.length < 400 &&
    record.recommendation.length < 400
  );
}
