"use client";

import type { AccessibilityFinding } from "@/lib/types";
import { ImageFrame } from "./ImageFrame";

export function SideBySideComparison({
  original,
  simulated,
  originalLabel,
  simulatedLabel,
  displayWidth,
  displayHeight,
  findings,
  selectedId,
  onSelect,
}: {
  original: ImageData;
  simulated: ImageData;
  originalLabel: string;
  simulatedLabel: string;
  displayWidth: number;
  displayHeight: number;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex w-max min-w-full flex-col gap-4 md:flex-row md:items-start">
      <ImageFrame
        imageData={original}
        label={originalLabel}
        width={displayWidth}
        height={displayHeight}
        findings={findings}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <ImageFrame
        imageData={simulated}
        label={simulatedLabel}
        width={displayWidth}
        height={displayHeight}
        findings={findings}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}
