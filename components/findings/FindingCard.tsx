"use client";

import { formatContrastRatio } from "@/lib/contrast/contrastRatio";
import type { AccessibilityFinding } from "@/lib/types";

export function FindingCard({
  finding,
  index,
  selected,
  onSelect,
}: {
  finding: AccessibilityFinding;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      id={`finding-${finding.id}`}
      className={`rounded-md border px-3 py-3 ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <button type="button" className="w-full text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--text-subtle)]">{number}</p>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              finding.severity === "high"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] text-[var(--warning)]"
            }`}
          >
            {finding.severity}
          </span>
        </div>
        <h3 className="mt-1 text-[13px] font-semibold text-[var(--text)]">{finding.title}</h3>
      </button>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
        <dt className="text-[var(--text-subtle)]">Contrast</dt>
        <dd className="font-medium tabular-nums text-[var(--text)]">{formatContrastRatio(finding.contrastRatio, 1)}</dd>
        <dt className="text-[var(--text-subtle)]">Expected</dt>
        <dd className="tabular-nums text-[var(--text)]">{formatContrastRatio(finding.requiredRatio, 1)}</dd>
        <dt className="text-[var(--text-subtle)]">Status</dt>
        <dd className="text-[var(--text)]">
          {finding.severity === "high" ? "Potential issue below 3:1" : "Potential WCAG AA issue"}
        </dd>
      </dl>
      <div className="mt-3 flex gap-2 text-[11px]">
        <Swatch label="Foreground" hex={finding.foregroundColor} />
        <Swatch label="Background" hex={finding.backgroundColor} />
      </div>
      {finding.suggestedForegroundColor ? (
        <div className="mt-2">
          <Swatch label="Suggested foreground" hex={finding.suggestedForegroundColor} />
        </div>
      ) : null}
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-subtle)]">
          Why this matters
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">{finding.whyItMatters}</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-subtle)]">
          Suggested fix
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">{finding.recommendation}</p>
      </div>
    </article>
  );
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="h-4 w-4 shrink-0 rounded-sm border border-[var(--border)]"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-[var(--text-subtle)]">{label}</span>
        <span className="font-mono text-[11px] text-[var(--text)]">{hex}</span>
      </span>
    </div>
  );
}
