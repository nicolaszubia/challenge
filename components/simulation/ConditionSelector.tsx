"use client";

import type { VisionCondition } from "@/lib/types";
import { VISION_CONDITIONS } from "@/lib/vision/conditions";

export function ConditionSelector({
  value,
  onChange,
}: {
  value: VisionCondition;
  onChange: (value: VisionCondition) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Vision condition</legend>
      <div className="flex flex-col gap-0.5">
        {VISION_CONDITIONS.map((condition) => {
          const selected = condition.id === value;
          return (
            <label
              key={condition.id}
              className={`flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 text-left ${
                selected ? "bg-[var(--accent-soft)]" : "hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
              }`}
            >
              <input
                type="radio"
                name="vision-condition"
                value={condition.id}
                checked={selected}
                onChange={() => onChange(condition.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-[13px] font-medium text-[var(--text)]">{condition.label}</span>
                <span className="mt-0.5 block text-[12px] leading-4 text-[var(--text-muted)]">
                  {condition.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
