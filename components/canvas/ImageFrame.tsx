"use client";

import { useEffect, useRef } from "react";
import { CommentOverlay } from "@/components/comments/CommentOverlay";
import type { AccessibilityFinding, ImageComment } from "@/lib/types";
import { IssueOverlay } from "./IssueOverlay";

export function ImageFrame({
  imageData,
  label,
  findings,
  selectedId,
  onSelect,
  width,
  height,
  comments,
  selectedCommentId,
  commenting,
  showCommentPopover,
  onSelectComment,
  onChangeComment,
  onSaveComment,
  onCloseComment,
}: {
  imageData: ImageData;
  label: string;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  width: number;
  height: number;
  comments: ImageComment[];
  selectedCommentId: string | null;
  commenting: boolean;
  showCommentPopover: boolean;
  onSelectComment: (id: string) => void;
  onChangeComment: (next: ImageComment) => void;
  onSaveComment: (next: ImageComment) => void;
  onCloseComment: () => void;
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
    <figure className="shrink-0">
      <figcaption className="mb-2 text-[11px] font-medium tracking-[0.12em] text-[var(--text-subtle)] uppercase">
        {label}
      </figcaption>
      <div className="relative" style={{ width, height }}>
        <div className="relative h-full w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--canvas)]">
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
        {commenting || comments.length > 0 ? (
          <CommentOverlay
            imageWidth={imageData.width}
            imageHeight={imageData.height}
            comments={comments}
            selectedId={selectedCommentId}
            commenting={commenting}
            showPopover={showCommentPopover}
            onSelect={onSelectComment}
            onChange={onChangeComment}
            onSave={onSaveComment}
            onClose={onCloseComment}
          />
        ) : null}
      </div>
    </figure>
  );
}
