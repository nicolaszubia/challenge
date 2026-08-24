"use client";

import { UploadZone } from "./UploadZone";

type EmptyStateProps = {
  onFile: (file: File) => Promise<void> | void;
  onSample: () => Promise<void> | void;
  sampleLoading: boolean;
  sampleError: string | null;
};

export function EmptyState({ onFile, onSample, sampleLoading, sampleError }: EmptyStateProps) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-16">
      <p className="text-[12px] font-medium tracking-[0.08em] text-[var(--text-subtle)] uppercase">
        An experiment by LaunchPad Lab
      </p>
      <p className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
        See your interface differently.
      </p>
      <p className="mt-3 max-w-[46ch] text-[15px] leading-6 text-[var(--text-muted)]">
        Upload a screenshot to simulate visual conditions and identify potential accessibility issues.
      </p>
      <div className="mt-8">
        <UploadZone onFile={onFile} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          className="text-[13px] font-medium text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-60"
          onClick={() => void onSample()}
          disabled={sampleLoading}
        >
          {sampleLoading ? "Loading sample…" : "Try a sample"}
        </button>
        <p className="text-[12px] text-[var(--text-subtle)]">Your image is processed locally in your browser.</p>
      </div>
      {sampleError ? (
        <p role="alert" className="mt-3 text-[13px] text-[var(--danger)]">
          {sampleError}
        </p>
      ) : null}
    </main>
  );
}
