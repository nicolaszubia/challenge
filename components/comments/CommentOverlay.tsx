"use client";

import type { ImageComment } from "@/lib/types";
import { CommentPopover } from "./CommentPopover";

export function CommentOverlay({
  imageWidth,
  imageHeight,
  comments,
  selectedId,
  commenting,
  showPopover,
  onSelect,
  onChange,
  onSave,
  onClose,
}: {
  imageWidth: number;
  imageHeight: number;
  comments: ImageComment[];
  selectedId: string | null;
  commenting: boolean;
  showPopover: boolean;
  onSelect: (id: string) => void;
  onChange: (next: ImageComment) => void;
  onSave: (next: ImageComment) => void;
  onClose: () => void;
}) {
  const selected = comments.find((comment) => comment.id === selectedId) ?? null;
  const selectedIndex = selected ? comments.indexOf(selected) : -1;
  const markerSize = Math.max(18, Math.min(imageWidth, imageHeight) * 0.028);

  return (
    <div className="pointer-events-none absolute inset-0 z-[25]">
      {commenting ? (
        <div className="absolute inset-0 bg-[rgba(33,85,214,0.12)]" aria-hidden="true" />
      ) : null}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        role="group"
        aria-label="Image comments"
      >
        {comments.map((comment, index) => {
          const selectedComment = comment.id === selectedId;
          const fill = comment.resolved ? "#C4A07A" : selectedComment ? "#9A430A" : "#C45C12";
          return (
            <a
              key={comment.id}
              data-comment-marker=""
              className="pointer-events-auto cursor-pointer"
              href={`#comment-${comment.id}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(comment.id);
              }}
            >
              <title>
                {comment.resolved
                  ? `Resolved comment ${index + 1}`
                  : `Comment ${index + 1}${comment.body ? `: ${comment.body}` : ""}`}
              </title>
              <circle
                cx={comment.x}
                cy={comment.y}
                r={selectedComment ? markerSize * 0.72 : markerSize * 0.58}
                fill="rgba(196, 92, 18, 0.18)"
              />
              <rect
                x={comment.x - markerSize * 0.67}
                y={comment.y - markerSize * 0.5}
                width={markerSize * 1.35}
                height={markerSize}
                rx={4}
                fill={fill}
              />
              <text
                x={comment.x}
                y={comment.y + markerSize * 0.18}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={markerSize * 0.52}
                fontWeight={600}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                C{index + 1}
              </text>
            </a>
          );
        })}
      </svg>

      {showPopover && selected && selectedIndex >= 0 ? (
        <div className="pointer-events-auto">
          <CommentPopover
            key={selected.id}
            comment={selected}
            index={selectedIndex}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            onChange={onChange}
            onSave={onSave}
            onClose={onClose}
          />
        </div>
      ) : null}
    </div>
  );
}
