"use client";

import type { AccessibilityFinding } from "@/lib/types";

export function IssueOverlay({
  width,
  height,
  findings,
  selectedId,
  onSelect,
}: {
  width: number;
  height: number;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (findings.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Accessibility issue markers"
    >
      {findings.map((finding, index) => {
        const selected = finding.id === selectedId;
        const { x, y, width: w, height: h } = finding.bounds;
        const markerSize = Math.max(18, Math.min(width, height) * 0.028);
        const labelY = Math.max(0, y - markerSize - 2);
        return (
          <g key={finding.id}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={selected ? "rgba(33, 85, 214, 0.12)" : "transparent"}
              stroke={selected ? "#1A44B0" : "#2155D6"}
              strokeWidth={selected ? Math.max(2, width * 0.0025) : Math.max(1.5, width * 0.002)}
            />
            <a
              data-issue-marker=""
              className="pointer-events-auto cursor-pointer"
              href={`#finding-${finding.id}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(finding.id);
              }}
            >
              <title>{`Accessibility issue ${index + 1}: ${finding.title}.`}</title>
              <rect
                x={x}
                y={labelY}
                width={markerSize * 1.35}
                height={markerSize}
                rx={4}
                fill={selected ? "#1A44B0" : "#2155D6"}
              />
              <text
                x={x + markerSize * 0.675}
                y={labelY + markerSize * 0.68}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={markerSize * 0.58}
                fontWeight={600}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {index + 1}
              </text>
            </a>
          </g>
        );
      })}
    </svg>
  );
}
