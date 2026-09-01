import type { ImageComment } from "@/lib/types";

const PREFIX = "spectra.comments.v1:";

export function commentStorageKey(fileName: string, width: number, height: number): string {
  return `${PREFIX}${fileName}:${width}x${height}`;
}

export function loadComments(key: string): ImageComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isImageComment);
  } catch {
    return [];
  }
}

export function saveComments(key: string, comments: ImageComment[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(comments));
}

export function createComment(x: number, y: number): ImageComment {
  const now = new Date().toISOString();
  return {
    id: `comment-${crypto.randomUUID()}`,
    x,
    y,
    body: "",
    resolved: false,
    createdAt: now,
    updatedAt: now,
  };
}

function isImageComment(value: unknown): value is ImageComment {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.x === "number" &&
    typeof record.y === "number" &&
    typeof record.body === "string" &&
    typeof record.resolved === "boolean" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}
