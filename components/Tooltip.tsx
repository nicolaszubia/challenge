"use client";

import { useId, useState } from "react";

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] text-[11px] font-medium text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-[calc(100%+8px)] z-20 w-56 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-[12px] leading-5 text-[var(--text)] shadow-sm"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
