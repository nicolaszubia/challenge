"use client";

import { useEffect, useRef } from "react";
import { CommentOverlay } from "@/components/comments/CommentOverlay";
import type { AccessibilityFinding, ImageComment } from "@/lib/types";
import { IssueOverlay } from "./IssueOverlay";

export function ComparisonSlider({
  original,
  simulated,
  originalLabel,
  simulatedLabel,
  position,
  onPositionChange,
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
  onSaveComment,
  onCloseComment,
}: {
  original: ImageData;
  simulated: ImageData;
  originalLabel: string;
  simulatedLabel: string;
  position: number;
  onPositionChange: (value: number) => void;
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
  onSaveComment: (next: ImageComment) => void;
  onCloseComment: () => void;
}) {
  const originalRef = useRef<HTMLCanvasElement>(null);
  const simulatedRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pointer = useRef({ x: 0, moved: false, fromHandle: false });

  useEffect(() => {
    const paint = (canvas: HTMLCanvasElement | null, data: ImageData) => {
      if (!canvas) return;
      canvas.width = data.width;
      canvas.height = data.height;
      canvas.getContext("2d")?.putImageData(data, 0, 0);
    };
    paint(originalRef.current, original);
    paint(simulatedRef.current, simulated);
  }, [original, simulated]);

  function setFromClientX(clientX: number, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    onPositionChange(Math.min(100, Math.max(0, next)));
  }

  function imagePoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    return {
      x: Math.min(original.width, Math.max(0, ((clientX - rect.left) / rect.width) * original.width)),
      y: Math.min(original.height, Math.max(0, ((clientY - rect.top) / rect.height) * original.height)),
    };
  }

  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-medium tracking-[0.12em] text-[var(--text-subtle)] uppercase">
        <span>{originalLabel}</span>
        <span>{simulatedLabel}</span>
      </div>
      <div
        ref={frameRef}
        className="relative overflow-visible rounded-md border border-[var(--border)] bg-[var(--canvas)]"
        style={{ width: displayWidth, height: displayHeight }}
        onPointerDown={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("[data-issue-marker], [data-comment-marker]")
          ) {
            return;
          }
          const fromHandle = event.target instanceof Element && Boolean(event.target.closest("[data-slider-handle]"));
          dragging.current = true;
          pointer.current = { x: event.clientX, moved: false, fromHandle };
          event.currentTarget.setPointerCapture(event.pointerId);
          if (fromHandle || !commenting) {
            setFromClientX(event.clientX, event.currentTarget);
          }
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          if (Math.abs(event.clientX - pointer.current.x) > 4) pointer.current.moved = true;
          if (pointer.current.fromHandle || !commenting || pointer.current.moved) {
            setFromClientX(event.clientX, event.currentTarget);
          }
        }}
        onPointerUp={(event) => {
          if (
            dragging.current &&
            commenting &&
            !pointer.current.moved &&
            !pointer.current.fromHandle
          ) {
            const point = imagePoint(event.clientX, event.clientY);
            if (point) onCreateComment(point.x, point.y);
          }
          dragging.current = false;
        }}
      >
        <canvas
          ref={originalRef}
          className="absolute inset-0 h-full w-full"
          style={{ width: displayWidth, height: displayHeight }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <canvas
            ref={simulatedRef}
            className="h-full w-full"
            style={{ width: displayWidth, height: displayHeight }}
            aria-hidden="true"
          />
        </div>
        <div
          className="pointer-events-none absolute top-0 z-40 h-full w-px bg-white"
          style={{ left: `${position}%`, boxShadow: "0 0 0 1px rgba(0,0,0,0.25)" }}
        >
          <div
            data-slider-handle=""
            className="pointer-events-auto absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-black/15 bg-white text-[11px] text-[var(--text)] shadow-sm"
          >
            ↔
          </div>
        </div>
        <IssueOverlay
          width={original.width}
          height={original.height}
          findings={findings}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        {commenting || comments.length > 0 ? (
          <CommentOverlay
            imageWidth={original.width}
            imageHeight={original.height}
            comments={comments}
            selectedId={selectedCommentId}
            commenting={commenting}
            showPopover
            onSelect={onSelectComment}
            onChange={onChangeComment}
            onSave={onSaveComment}
            onClose={onCloseComment}
          />
        ) : null}
      </div>
      <label className="sr-only" htmlFor="comparison-position">
        Comparison position
      </label>
      <input
        id="comparison-position"
        type="range"
        min={0}
        max={100}
        value={Math.round(position)}
        onChange={(event) => onPositionChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--accent)]"
        aria-valuetext={`${Math.round(position)} percent simulation`}
      />
    </div>
  );
}
