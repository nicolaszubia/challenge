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
  onCreate,
  onChange,
  onClose,
}: {
  imageWidth: number;
  imageHeight: number;
  comments: ImageComment[];
  selectedId: string | null;
  commenting: boolean;
  showPopover: boolean;
  onSelect: (id: string) => void;
  onCreate: (x: number, y: number) => void;
  onChange: (next: ImageComment) => void;
  onClose: () => void;
}) {
  const selected = comments.find((comment) => comment.id === selectedId) ?? null;
  const selectedIndex = selected ? comments.indexOf(selected) : -1;
  const markerSize = Math.max(18, Math.min(imageWidth, imageHeight) * 0.028);

  function pointFromEvent(event: React.MouseEvent<HTMLElement>): { x: number; y: number } {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * imageWidth;
    const y = ((event.clientY - rect.top) / rect.height) * imageHeight;
    return {
      x: Math.min(imageWidth, Math.max(0, x)),
      y: Math.min(imageHeight, Math.max(0, y)),
    };
  }

  return (
    <div className="absolute inset-0 z-[25]">
      {commenting ? (
        <button
          type="button"
          data-comment-layer=""
          className="absolute inset-0 cursor-crosshair border-0 bg-[rgba(33,85,214,0.12)] p-0"
          aria-label="Click to add a comment"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            if ((event.target as Element | null)?.closest?.("[data-comment-marker]")) return;
            const point = pointFromEvent(event);
            onCreate(point.x, point.y);
          }}
        />
      ) : null}

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
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
        <CommentPopover
          comment={selected}
          index={selectedIndex}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          onChange={onChange}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}
