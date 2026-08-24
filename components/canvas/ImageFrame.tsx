"use client";

import { useEffect, useRef } from "react";
import type { AccessibilityFinding } from "@/lib/types";
import { IssueOverlay } from "./IssueOverlay";

export function ImageFrame({
  imageData,
  label,
  findings,
  selectedId,
  onSelect,
  width,
  height,
}: {
  imageData: ImageData;
  label: string;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.putImageData(imageData, 0, 0);
  }, [imageData]);

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-[11px] font-medium tracking-[0.12em] text-[var(--text-subtle)] uppercase">
        {label}
      </figcaption>
      <div className="relative overflow-hidden rounded-md border border-[var(--border)] bg-[var(--canvas)]" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{ width, height }}
          aria-label={`${label} screenshot`}
        />
        <IssueOverlay
          width={imageData.width}
          height={imageData.height}
          findings={findings}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
    </figure>
  );
}
