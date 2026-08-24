"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";

export function ExportMenu({
  onSimulation,
  onAnnotated,
  onCopy,
  copyDisabled,
}: {
  onSimulation: () => Promise<void>;
  onAnnotated: () => Promise<void>;
  onCopy: () => Promise<void>;
  copyDisabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function run(action: () => Promise<void>, successCopy = false) {
    try {
      setError(null);
      await action();
      if (successCopy) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
      setOpen(false);
    } catch {
      setError("Export failed. Try again.");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-8 items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[12px] font-medium text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        Export
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm"
        >
          <MenuItem onClick={() => void run(onSimulation)}>Download simulation</MenuItem>
          <MenuItem onClick={() => void run(onAnnotated)}>Download annotated image</MenuItem>
          <MenuItem disabled={copyDisabled} onClick={() => void run(onCopy, true)}>
            {copied ? "Copied" : "Copy findings"}
          </MenuItem>
        </div>
      ) : null}
      {error ? <div className="absolute right-0 top-full"><ErrorMessage>{error}</ErrorMessage></div> : null}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className="flex h-8 w-full items-center rounded px-2 text-left text-[13px] text-[var(--text)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
