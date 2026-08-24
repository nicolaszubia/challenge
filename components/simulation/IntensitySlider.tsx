"use client";

import { Tooltip } from "@/components/Tooltip";

export function IntensitySlider({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="simulation-intensity" className="text-[13px] font-medium text-[var(--text)]">
          Simulation intensity
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{value}%</span>
          <Tooltip label="About simulation intensity">
            Intensity controls the strength of the visual approximation. It does not represent a clinical diagnosis.
          </Tooltip>
        </div>
      </div>
      <input
        id="simulation-intensity"
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value} percent`}
        className="mt-2 w-full accent-[var(--accent)]"
      />
      <div className="mt-1 flex justify-between text-[11px] text-[var(--text-subtle)]">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
