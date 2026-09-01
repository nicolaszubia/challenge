"use client";

import { useEffect, useRef } from "react";
import type { ImageComment } from "@/lib/types";

export function CommentList({
  comments,
  selectedId,
  onSelect,
}: {
  comments: ImageComment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const saved = comments.filter((comment) => !comment.draft);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const node = listRef.current.querySelector(`#comment-card-${selectedId}`);
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (saved.length === 0) {
    return (
      <div className="px-1 py-2">
        <p className="text-[13px] leading-5 text-[var(--text)]">No comments yet.</p>
        <p className="mt-2 text-[12px] leading-5 text-[var(--text-subtle)]">
          Use Add comments, click the image, then Save to keep a note.
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-2">
      {comments.map((comment, index) => {
        if (comment.draft) return null;
        const selected = comment.id === selectedId;
        return (
          <button
            key={comment.id}
            id={`comment-card-${comment.id}`}
            type="button"
            className={`w-full rounded-md border px-3 py-2.5 text-left ${
              selected
                ? "border-[var(--comment)] bg-[var(--comment-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
            onClick={() => onSelect(comment.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--comment)] uppercase">
                C{index + 1}
              </p>
              {comment.resolved ? (
                <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-subtle)]">
                  Resolved
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--text)]">{comment.body}</p>
          </button>
        );
      })}
    </div>
  );
}
