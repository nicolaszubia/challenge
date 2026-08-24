"use client";

import { ExportMenu } from "./ExportMenu";
import { ImageStage } from "./canvas/ImageStage";
import { FindingsPanel } from "./findings/FindingsPanel";
import { SimulationPanel } from "./simulation/SimulationPanel";
import type { AccessibilityFinding, AnalysisStatus, ComparisonMode, VisionCondition } from "@/lib/types";

export function Workspace({
  fileName,
  resized,
  original,
  simulated,
  condition,
  intensity,
  processing,
  processError,
  comparisonMode,
  sliderPosition,
  analysisStatus,
  findings,
  selectedId,
  filter,
  aiNotice,
  onConditionChange,
  onIntensityChange,
  onComparisonModeChange,
  onSliderPositionChange,
  onAnalyze,
  onSelectFinding,
  onFilterChange,
  onExportSimulation,
  onExportAnnotated,
  onCopyFindings,
  onNewImage,
}: {
  fileName: string;
  resized: boolean;
  original: ImageData;
  simulated: ImageData;
  condition: VisionCondition;
  intensity: number;
  processing: boolean;
  processError: string | null;
  comparisonMode: ComparisonMode;
  sliderPosition: number;
  analysisStatus: AnalysisStatus;
  findings: AccessibilityFinding[];
  selectedId: string | null;
  filter: "all" | "high" | "medium";
  aiNotice: string | null;
  onConditionChange: (value: VisionCondition) => void;
  onIntensityChange: (value: number) => void;
  onComparisonModeChange: (value: ComparisonMode) => void;
  onSliderPositionChange: (value: number) => void;
  onAnalyze: () => void;
  onSelectFinding: (id: string) => void;
  onFilterChange: (value: "all" | "high" | "medium") => void;
  onExportSimulation: () => Promise<void>;
  onExportAnnotated: () => Promise<void>;
  onCopyFindings: () => Promise<void>;
  onNewImage: () => void;
}) {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-4">
        <p className="min-w-0 truncate text-[12px] text-[var(--text-muted)]">
          {fileName}
          {resized ? " · resized for local processing" : ""}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <ExportMenu
            onSimulation={onExportSimulation}
            onAnnotated={onExportAnnotated}
            onCopy={onCopyFindings}
            copyDisabled={analysisStatus !== "complete"}
          />
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] font-medium text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)] hover:text-[var(--text)]"
            onClick={onNewImage}
          >
            New image
          </button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <div className="min-h-[280px] lg:min-h-0">
          <SimulationPanel
            condition={condition}
            intensity={intensity}
            processing={processing}
            processError={processError}
            onConditionChange={onConditionChange}
            onIntensityChange={onIntensityChange}
          />
        </div>
        <ImageStage
          original={original}
          simulated={simulated}
          condition={condition}
          comparisonMode={comparisonMode}
          onComparisonModeChange={onComparisonModeChange}
          sliderPosition={sliderPosition}
          onSliderPositionChange={onSliderPositionChange}
          findings={analysisStatus === "complete" ? findings : []}
          selectedId={selectedId}
          onSelect={onSelectFinding}
        />
        <div className="min-h-[320px] lg:min-h-0">
          <FindingsPanel
            analysisStatus={analysisStatus}
            findings={findings}
            selectedId={selectedId}
            onSelect={onSelectFinding}
            filter={filter}
            onFilterChange={onFilterChange}
            aiNotice={aiNotice}
            onAnalyze={onAnalyze}
            analyzing={analysisStatus === "analyzing"}
          />
        </div>
      </div>
    </main>
  );
}
