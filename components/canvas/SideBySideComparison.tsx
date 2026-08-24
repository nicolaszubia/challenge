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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
