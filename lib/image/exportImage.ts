import type { AccessibilityFinding, ImageComment } from "@/lib/types";
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

export async function exportCommentedPng(
  imageData: ImageData,
  comments: ImageComment[],
  fileName: string,
): Promise<void> {
  const source = imageDataToCanvas(imageData);
  const scale = Math.max(1, Math.min(imageData.width, imageData.height) / 720);
  const pad = Math.round(24 * scale);
  const titleSize = Math.max(16, 16 * scale);
  const bodySize = Math.max(13, 13 * scale);
  const lineHeight = Math.round(bodySize * 1.45);
  const contentWidth = imageData.width - pad * 2;

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  const blocks = comments.map((comment, index) => {
    const label = `C${index + 1}${comment.resolved ? " · Resolved" : ""}`;
    const text = comment.body.trim() || "No note added.";
    measure.font = `400 ${bodySize}px ui-sans-serif, system-ui, sans-serif`;
    const lines = wrapText(measure, text, contentWidth);
    return { label, lines, height: Math.round(titleSize * 1.2) + lines.length * lineHeight + pad * 0.4 };
  });

  const listHeight =
    comments.length === 0
      ? pad * 2 + lineHeight
      : pad + titleSize + pad * 0.6 + blocks.reduce((sum, block) => sum + block.height, 0) + pad;

  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height + listHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  context.fillStyle = "#F6F5F2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0);

  comments.forEach((comment, index) => {
    const size = Math.max(18, 18 * scale);
    const label = `C${index + 1}`;
    const width = size + (label.length > 2 ? size * 0.45 : 0);
    const x = comment.x - width / 2;
    const y = comment.y - size / 2;
    context.fillStyle = comment.resolved ? "#C4A07A" : "#C45C12";
    roundRect(context, x, y, width, size, 4 * scale);
    context.fill();
    context.fillStyle = "#FFFFFF";
    context.font = `600 ${Math.max(11, 11 * scale)}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, comment.x, comment.y);
  });

  let cursorY = imageData.height + pad;
  context.fillStyle = "#1C1B18";
  context.font = `650 ${titleSize}px ui-sans-serif, system-ui, sans-serif`;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText("Comments", pad, cursorY);
  cursorY += titleSize + pad * 0.6;

  if (comments.length === 0) {
    context.fillStyle = "#6C6960";
    context.font = `400 ${bodySize}px ui-sans-serif, system-ui, sans-serif`;
    context.fillText("No comments on this screenshot.", pad, cursorY);
  } else {
    blocks.forEach((block) => {
      context.fillStyle = "#C45C12";
      context.font = `650 ${bodySize}px ui-sans-serif, system-ui, sans-serif`;
      context.fillText(block.label, pad, cursorY);
      cursorY += Math.round(titleSize * 1.2);
      context.fillStyle = "#1C1B18";
      context.font = `400 ${bodySize}px ui-sans-serif, system-ui, sans-serif`;
      block.lines.forEach((line) => {
        context.fillText(line, pad, cursorY);
        cursorY += lineHeight;
      });
      cursorY += pad * 0.4;
    });
  }

  const blob = await canvasToPngBlob(canvas);
  downloadBlob(blob, fileName);
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (context.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
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
