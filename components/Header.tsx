export function Header() {
  return (
    <header className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[13px] font-semibold tracking-[0.16em] text-[var(--text)]">SPECTRA</h1>
        <p className="hidden text-[12px] text-[var(--text-muted)] sm:block">Visual Accessibility QA</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
          Experimental
        </span>
        <p className="text-[12px] text-[var(--text-subtle)]">LaunchPad Lab</p>
      </div>
    </header>
  );
}
