"use client";

import { useRef, useState } from "react";
import { ErrorMessage } from "./ErrorMessage";
import { ImageLoadError, validateImageFile } from "@/lib/image/loadImage";

type UploadZoneProps = {
  onFile: (file: File) => Promise<void> | void;
  compact?: boolean;
};

export function UploadZone({ onFile, compact = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      validateImageFile(file);
      setError(null);
      await onFile(file);
    } catch (caught) {
      setError(caught instanceof ImageLoadError ? caught.message : "That file could not be used.");
    }
  }

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={`rounded-lg border border-dashed px-6 text-center transition-colors ${
          compact ? "py-6" : "py-12"
        } ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border-strong)] bg-[var(--surface)]"
        }`}
      >
        <p className="text-[15px] font-medium text-[var(--text)]">Drop a screenshot here</p>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">PNG, JPG, or WebP · up to 10 MB</p>
        <button
          type="button"
          className="mt-4 inline-flex h-9 items-center rounded-md bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:bg-[var(--accent-hover)]"
          onClick={() => inputRef.current?.click()}
        >
          Choose image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </div>
  );
}
