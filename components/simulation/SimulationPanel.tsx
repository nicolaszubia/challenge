"use client";

import type { VisionCondition } from "@/lib/types";
import { getConditionMeta } from "@/lib/vision/conditions";
import { ConditionSelector } from "./ConditionSelector";
import { IntensitySlider } from "./IntensitySlider";

export function SimulationPanel({
  condition,
  intensity,
  processing,
  processError,
  onConditionChange,
  onIntensityChange,
}: {
  condition: VisionCondition;
  intensity: number;
  processing: boolean;
  processError: string | null;
  onConditionChange: (value: VisionCondition) => void;
  onIntensityChange: (value: number) => void;
}) {
  const meta = getConditionMeta(condition);

  return (
    <section className="flex h-full flex-col border-[var(--border)] bg-[var(--surface)] lg:border-r">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Vision simulation</h2>
        {processError ? (
          <p className="mt-1 text-[12px] text-[var(--danger)]" role="alert">
            {processError}
          </p>
        ) : processing ? (
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">Generating simulation…</p>
        ) : (
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">Approximations for design review.</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <ConditionSelector value={condition} onChange={onConditionChange} />
        <div className="mt-4 border-t border-[var(--border)] px-1 pt-4">
          <IntensitySlider
            value={intensity}
            onChange={onIntensityChange}
            disabled={!meta.supportsIntensity}
          />
        </div>
        <details className="mt-4 px-1">
          <summary className="cursor-pointer text-[12px] font-medium text-[var(--text-muted)]">
            About simulations
          </summary>
          <p className="mt-2 text-[12px] leading-5 text-[var(--text-subtle)]">
            Spectra provides visual approximations intended to help designers identify potential
            accessibility concerns. Individual experiences vary, and simulations should not replace
            testing with real users.
          </p>
        </details>
      </div>
    </section>
  );
}
