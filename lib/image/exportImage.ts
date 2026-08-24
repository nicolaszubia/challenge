import type { AccessibilityFinding } from "@/lib/types";
import { canvasToPngBlob, downloadBlob, imageDataToCanvas } from "./canvas";
import { formatContrastRatio } from "@/lib/contrast/contrastRatio";

export async function exportSimulationPng(imageData: ImageData, fileName: string): Promise<void> {
  const canvas = imageDataToCanvas(imageData);
  const blob = await canvasToPngBlob(canvas);
  downloadBlob(blob, fileName);
}

export async function exportAnnotatedPng(
  imageData: ImageData,
  findings: AccessibilityFinding[],
  selectedId: string | null,
  fileName: string,
): Promise<void> {
  const canvas = imageDataToCanvas(imageData);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 720);
  findings.forEach((finding, index) => {
    const selected = finding.id === selectedId;
    const { x, y, width, height } = finding.bounds;
    context.save();
    context.strokeStyle = selected ? "#1D4ED8" : "#2563EB";
    context.lineWidth = Math.max(2, 2 * scale);
    context.strokeRect(x + 0.5, y + 0.5, width, height);

    const marker = String(index + 1).padStart(2, "0");
    const size = Math.max(18, 18 * scale);
    const labelX = x;
    const labelY = Math.max(0, y - size);
    context.fillStyle = selected ? "#1D4ED8" : "#2563EB";
    roundRect(context, labelX, labelY, size + (marker.length > 1 ? size * 0.35 : 0), size, 4 * scale);
    context.fill();
    context.fillStyle = "#FFFFFF";
    context.font = `600 ${Math.max(11, 11 * scale)}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(index + 1), labelX + (size + (marker.length > 1 ? size * 0.35 : 0)) / 2, labelY + size / 2);
    context.restore();
  });

  const blob = await canvasToPngBlob(canvas);
  downloadBlob(blob, fileName);
}

export function formatFindingsText(findings: AccessibilityFinding[]): string {
  const lines = [
    "SPECTRA ACCESSIBILITY REVIEW",
    `${findings.length} potential issue${findings.length === 1 ? "" : "s"} detected`,
    "",
  ];

  if (findings.length === 0) {
    lines.push("No obvious contrast issues detected.");
    lines.push("This does not guarantee WCAG compliance. Spectra currently analyzes visual characteristics of the screenshot.");
    return lines.join("\n");
  }

  findings.forEach((finding, index) => {
    const number = String(index + 1).padStart(2, "0");
    lines.push(`${number} — ${finding.title}`);
    lines.push(`Contrast ratio: ${formatContrastRatio(finding.contrastRatio, 1)}`);
    lines.push(`Expected: ${formatContrastRatio(finding.requiredRatio, 1)}`);
    lines.push(`Foreground: ${finding.foregroundColor}`);
    lines.push(`Background: ${finding.backgroundColor}`);
    if (finding.suggestedForegroundColor) {
      lines.push(`Suggested foreground: ${finding.suggestedForegroundColor}`);
    }
    lines.push(`Recommendation: ${finding.recommendation}`);
    lines.push("");
  });

  lines.push("Findings are potential issues from screenshot pixels, not a WCAG compliance result.");
  return lines.join("\n").trim();
}

export async function copyFindings(findings: AccessibilityFinding[]): Promise<void> {
  const text = formatFindingsText(findings);
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard access is not available.");
  }
  await navigator.clipboard.writeText(text);
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
