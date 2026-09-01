"use client";

import { useEffect, useRef, useState } from "react";
import type { AccessibilityFinding, ImageComment, VisionCondition } from "@/lib/types";
import { getConditionMeta } from "@/lib/vision/conditions";
import { ComparisonSlider } from "./ComparisonSlider";
import { ZoomControls } from "./ZoomControls";

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function ImageStage({
  original,
  simulated,
  condition,
  sliderPosition,
  onSliderPositionChange,
  findings,
  selectedId,
  onSelect,
  comments,
  selectedCommentId,
  commenting,
  onSelectComment,
  onCreateComment,
  onChangeComment,
  onSaveComment,
  onCloseComment,
}: {
  original: ImageData;
  simulated: ImageData;
  condition: VisionCondition;
  sliderPosition: number;
  onSliderPositionChange: (value: number) => void;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  comments: ImageComment[];
  selectedCommentId: string | null;
  commenting: boolean;
  onSelectComment: (id: string) => void;
  onCreateComment: (x: number, y: number) => void;
  onChangeComment: (next: ImageComment) => void;
  onSaveComment: (next: ImageComment) => void;
  onCloseComment: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [zoomMode, setZoomMode] = useState<"fit" | number>("fit");

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setContainer({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const meta = getConditionMeta(condition);
  const display = getDisplaySize({
    imageWidth: original.width,
    imageHeight: original.height,
    containerWidth: container.width,
    containerHeight: container.height,
    zoomMode,
  });

  const numericZoom = display.scale;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        {commenting ? (
          <p className="text-[12px] text-[var(--comment)]">Click the image to add a comment. Drag the divider to compare.</p>
        ) : (
          <p className="text-[12px] text-[var(--text-muted)]">Comparison slider</p>
        )}
        <ZoomControls
          zoomLabel={zoomMode === "fit" ? "Fit" : `${Math.round(numericZoom * 100)}%`}
          onFit={() => setZoomMode("fit")}
          onActual={() => setZoomMode(1)}
          onOut={() => {
            const prev = [...ZOOM_STEPS].reverse().find((step) => step < numericZoom - 0.01);
            setZoomMode(prev ?? ZOOM_STEPS[0]);
          }}
          onIn={() => {
            const next = ZOOM_STEPS.find((step) => step > numericZoom + 0.01);
            setZoomMode(next ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]);
          }}
          canZoomOut={numericZoom > ZOOM_STEPS[0]}
          canZoomIn={numericZoom < ZOOM_STEPS[ZOOM_STEPS.length - 1]}
        />
      </div>
      <div ref={containerRef} className="checkerboard min-h-0 flex-1 overflow-auto p-4">
        {display.width > 0 ? (
          <ComparisonSlider
            original={original}
            simulated={simulated}
            originalLabel="Original"
            simulatedLabel={meta.shortLabel}
            position={sliderPosition}
            onPositionChange={onSliderPositionChange}
            displayWidth={display.width}
            displayHeight={display.height}
            findings={findings}
            selectedId={selectedId}
            onSelect={onSelect}
            comments={comments}
            selectedCommentId={selectedCommentId}
            commenting={commenting}
            onSelectComment={onSelectComment}
            onCreateComment={onCreateComment}
            onChangeComment={onChangeComment}
            onSaveComment={onSaveComment}
            onCloseComment={onCloseComment}
          />
        ) : null}
      </div>
    </div>
  );
}

function getDisplaySize({
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  zoomMode,
}: {
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  zoomMode: "fit" | number;
}): { width: number; height: number; scale: number } {
  if (containerWidth < 40 || containerHeight < 40) {
    return { width: 0, height: 0, scale: 1 };
  }

  if (zoomMode !== "fit") {
    return {
      width: Math.round(imageWidth * zoomMode),
      height: Math.round(imageHeight * zoomMode),
      scale: zoomMode,
    };
  }

  const gutter = 32;
  const caption = 28;
  const availableHeight = Math.max(80, containerHeight - gutter - caption);
  const availableWidth = Math.max(80, containerWidth - gutter);
  const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  return {
    width: Math.max(1, Math.floor(imageWidth * scale)),
    height: Math.max(1, Math.floor(imageHeight * scale)),
    scale,
  };
}
