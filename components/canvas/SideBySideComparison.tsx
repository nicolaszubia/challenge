"use client";

import type { AccessibilityFinding, ImageComment } from "@/lib/types";
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
  comments,
  selectedCommentId,
  commenting,
  onSelectComment,
  onCreateComment,
  onChangeComment,
  onCloseComment,
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
  comments: ImageComment[];
  selectedCommentId: string | null;
  commenting: boolean;
  onSelectComment: (id: string) => void;
  onCreateComment: (x: number, y: number) => void;
  onChangeComment: (next: ImageComment) => void;
  onCloseComment: () => void;
}) {
  const shared = {
    width: displayWidth,
    height: displayHeight,
    findings,
    selectedId,
    onSelect,
    comments,
    selectedCommentId,
    commenting,
    onSelectComment,
    onCreateComment,
    onChangeComment,
    onCloseComment,
  };

  return (
    <div className="flex w-max min-w-full flex-col gap-4 md:flex-row md:items-start">
      <ImageFrame
        imageData={original}
        label={originalLabel}
        showCommentPopover
        {...shared}
      />
      <ImageFrame
        imageData={simulated}
        label={simulatedLabel}
        showCommentPopover={false}
        {...shared}
      />
    </div>
  );
}
