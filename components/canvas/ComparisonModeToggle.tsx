"use client";

import type { ComparisonMode } from "@/lib/types";

export function ComparisonModeToggle({
  value,
  onChange,
}: {
  value: ComparisonMode;
  onChange: (value: ComparisonMode) => void;
}) {
  return (
    <div role="tablist" aria-label="Comparison mode" className="inline-flex rounded-md border border-[var(--border)] p-0.5">
      {(
        [
          ["side-by-side", "Side by side"],
          ["slider", "Comparison slider"],
        ] as const
      ).map(([mode, label]) => {
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`h-7 rounded-[5px] px-2.5 text-[12px] font-medium ${
              selected
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            onClick={() => onChange(mode)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
