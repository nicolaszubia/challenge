"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ImageComment } from "@/lib/types";

export function CommentPopover({
  comment,
  index,
  imageWidth,
  imageHeight,
  onChange,
  onSave,
  onClose,
}: {
  comment: ImageComment;
  index: number;
  imageWidth: number;
  imageHeight: number;
  onChange: (next: ImageComment) => void;
  onSave: (next: ImageComment) => void;
  onClose: () => void;
}) {
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [draftBody, setDraftBody] = useState(comment.body);
  const left = (comment.x / imageWidth) * 100;
  const top = (comment.y / imageHeight) * 100;
  const alignRight = left > 62;
  const canSave = draftBody.trim().length > 0;

  useEffect(() => {
    areaRef.current?.focus();
  }, [comment.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={rootRef}
      data-comment-marker=""
      className="absolute z-30 w-[220px] rounded-md border border-[color-mix(in_srgb,var(--comment)_35%,var(--border))] bg-[var(--surface)] shadow-sm"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: alignRight ? "translate(-100%, 12px)" : "translate(12px, 12px)",
      }}
      role="dialog"
      aria-labelledby={labelId}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-2.5 py-1.5">
        <p id={labelId} className="text-[11px] font-semibold tracking-[0.08em] text-[var(--comment)] uppercase">
          Comment {String(index + 1).padStart(2, "0")}
          {comment.resolved ? " · Resolved" : ""}
        </p>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[14px] text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:text-[var(--text)]"
          aria-label="Close comment"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="p-2.5">
        <label className="sr-only" htmlFor={`${labelId}-body`}>
          Comment text
        </label>
        <textarea
          id={`${labelId}-body`}
          ref={areaRef}
          rows={3}
          value={draftBody}
          placeholder="Add a note about this area…"
          className="w-full resize-none rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[12px] leading-5 text-[var(--text)] outline-none focus-visible:border-[var(--comment)]"
          onChange={(event) => setDraftBody(event.target.value)}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          {comment.draft ? (
            <span />
          ) : (
            <button
              type="button"
              className="inline-flex h-7 items-center rounded px-2 text-[12px] font-medium text-[var(--comment)] hover:bg-[var(--comment-soft)]"
              onClick={() =>
                onChange({
                  ...comment,
                  resolved: !comment.resolved,
                  updatedAt: new Date().toISOString(),
                })
              }
            >
              {comment.resolved ? "Reopen" : "Mark resolved"}
            </button>
          )}
          <button
            type="button"
            className="ml-auto inline-flex h-7 items-center rounded-md bg-[var(--comment)] px-2.5 text-[12px] font-medium text-white hover:bg-[var(--comment-hover)] disabled:opacity-40"
            disabled={!canSave}
            onClick={() =>
              onSave({
                ...comment,
                body: draftBody.trim(),
                draft: false,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
