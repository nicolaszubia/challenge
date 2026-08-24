import { NextResponse } from "next/server";
import { isAiExplanation, type AiFindingPayload } from "@/lib/ai/types";

const SYSTEM_PROMPT = `You assist Spectra, a visual accessibility QA tool.
You receive deterministic contrast measurements from screenshot pixels.
Never invent or change numeric measurements, colors, or thresholds.
Do not claim WCAG compliance or failure. Use cautious language such as "may be difficult to distinguish".
Return JSON only: {"explanations":[{"id":"...","whyItMatters":"...","recommendation":"..."}]}.
Each string must be at most two short sentences.
Keep explanations practical and specific to contrast.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }

  let payload: { findings?: AiFindingPayload[] };
  try {
    payload = (await request.json()) as { findings?: AiFindingPayload[] };
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const findings = payload.findings ?? [];
  if (findings.length === 0) {
    return NextResponse.json({ explanations: [] });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify(
              findings.map((finding) => ({
                id: finding.id,
                type: finding.type,
                contrastRatio: Number(finding.contrastRatio.toFixed(2)),
                requiredRatio: finding.requiredRatio,
                foregroundColor: finding.foregroundColor,
                backgroundColor: finding.backgroundColor,
                severity: finding.severity,
              })),
            ),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
    }

    const parsed = JSON.parse(content) as { explanations?: unknown };
    const explanations = Array.isArray(parsed.explanations)
      ? parsed.explanations.filter(isAiExplanation)
      : [];

    return NextResponse.json({ explanations });
  } catch {
    return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
