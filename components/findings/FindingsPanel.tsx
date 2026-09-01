"use client";

import { useEffect, useRef } from "react";
import { CommentList } from "@/components/comments/CommentList";
import type { AccessibilityFinding, ImageComment, RightPanelTab } from "@/lib/types";
import { FindingCard } from "./FindingCard";

type Filter = "all" | "high" | "medium";

export function FindingsPanel({
  analysisStatus,
  findings,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  aiNotice,
  onAnalyze,
  analyzing,
  tab,
  onTabChange,
  comments,
  selectedCommentId,
  onSelectComment,
}: {
  analysisStatus: "idle" | "analyzing" | "complete";
  findings: AccessibilityFinding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: Filter;
  onFilterChange: (value: Filter) => void;
  aiNotice: string | null;
  onAnalyze: () => void;
  analyzing: boolean;
  tab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  comments: ImageComment[];
  selectedCommentId: string | null;
  onSelectComment: (id: string) => void;
}) {
  const visible = findings.filter((finding) => (filter === "all" ? true : finding.severity === filter));
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const node = listRef.current.querySelector(`#finding-${selectedId}`);
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const savedComments = comments.filter((comment) => !comment.draft).length;

  return (
    <section className="flex h-full flex-col border-[var(--border)] bg-[var(--surface)] lg:border-l">
      <div className="border-b border-[var(--border)] px-2 pt-2">
        <div className="flex gap-1" role="tablist" aria-label="Review panels">
          <TabButton selected={tab === "findings"} onClick={() => onTabChange("findings")}>
            Findings
          </TabButton>
          <TabButton selected={tab === "comments"} onClick={() => onTabChange("comments")}>
            Comments{savedComments ? ` (${savedComments})` : ""}
          </TabButton>
        </div>
      </div>
      {tab === "findings" ? (
        <>
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[var(--text)]">Accessibility findings</h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              {analysisStatus === "complete"
                ? `Potential issues: ${findings.length}`
                : "Contrast analysis of screenshot pixels."}
            </p>
          </div>
          <div className="border-b border-[var(--border)] px-4 py-3">
            <button
              type="button"
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-[var(--accent)] text-[13px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
              onClick={onAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing visual accessibility…" : "Analyze accessibility"}
            </button>
          </div>
          {analysisStatus === "complete" && findings.length > 0 ? (
            <div className="flex gap-1 border-b border-[var(--border)] px-3 py-2" role="group" aria-label="Filter findings">
              {(["all", "high", "medium"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`h-7 rounded-md px-2 text-[12px] capitalize ${
                    filter === item
                      ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                  onClick={() => onFilterChange(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {aiNotice ? <p className="text-[12px] leading-5 text-[var(--text-muted)]">{aiNotice}</p> : null}
            {analysisStatus === "idle" ? (
              <EmptyCopy
                title="Run an accessibility analysis to identify potential visual issues."
                body="Spectra currently looks for low-contrast regions in the screenshot. It cannot certify WCAG compliance."
              />
            ) : null}
            {analysisStatus === "analyzing" ? (
              <p className="text-[13px] text-[var(--text-muted)]">Analyzing contrast…</p>
            ) : null}
            {analysisStatus === "complete" && findings.length === 0 ? (
              <EmptyCopy
                title="No obvious contrast issues detected."
                body="This doesn't guarantee WCAG compliance. Spectra currently analyzes visual characteristics of the screenshot."
              />
            ) : null}
            {visible.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                index={findings.indexOf(finding)}
                selected={finding.id === selectedId}
                onSelect={() => onSelect(finding.id)}
              />
            ))}
            {analysisStatus === "complete" && visible.length === 0 && findings.length > 0 ? (
              <p className="text-[13px] text-[var(--text-muted)]">No findings in this filter.</p>
            ) : null}
            <p className="px-1 pt-2 text-[11px] leading-4 text-[var(--text-subtle)]">
              The screenshot stays in your browser. Optional AI explanations use finding metadata only.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[var(--text)]">Comments</h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              {savedComments === 0 ? "Notes pinned to this screenshot." : `${savedComments} saved`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <CommentList comments={comments} selectedId={selectedCommentId} onSelect={onSelectComment} />
          </div>
        </>
      )}
    </section>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`h-8 flex-1 rounded-md px-2 text-[12px] font-medium ${
        selected
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--text-muted)] hover:text-[var(--text)]"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EmptyCopy({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-1 py-2">
      <p className="text-[13px] leading-5 text-[var(--text)]">{title}</p>
      <p className="mt-2 text-[12px] leading-5 text-[var(--text-subtle)]">{body}</p>
    </div>
  );
}
