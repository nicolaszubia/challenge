"use client";

export function ZoomControls({
  zoomLabel,
  onFit,
  onActual,
  onIn,
  onOut,
  canZoomIn,
  canZoomOut,
}: {
  zoomLabel: string;
  onFit: () => void;
  onActual: () => void;
  onIn: () => void;
  onOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}) {
  const buttonClass =
    "h-7 rounded-md px-2 text-[12px] font-medium text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:text-[var(--text)] disabled:opacity-40";

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Zoom">
      <button type="button" className={buttonClass} onClick={onFit}>
        Fit
      </button>
      <button type="button" className={buttonClass} onClick={onActual}>
        100%
      </button>
      <button type="button" className={buttonClass} onClick={onOut} disabled={!canZoomOut} aria-label="Zoom out">
        −
      </button>
      <span className="min-w-10 text-center text-[12px] tabular-nums text-[var(--text-muted)]">{zoomLabel}</span>
      <button type="button" className={buttonClass} onClick={onIn} disabled={!canZoomIn} aria-label="Zoom in">
        +
      </button>
    </div>
  );
}
