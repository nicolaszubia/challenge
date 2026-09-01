"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "./EmptyState";
import { Header } from "./Header";
import { Workspace } from "./Workspace";
import { commentStorageKey, createComment, loadComments, saveComments } from "@/lib/comments/storage";
import { enrichFindings } from "@/lib/ai/enrich";
import { analyzeContrast } from "@/lib/contrast/analyze";
import { copyFindings, exportAnnotatedPng, exportCommentedPng, exportSimulationPng } from "@/lib/image/exportImage";
import { ImageLoadError } from "@/lib/image/loadImage";
import { prepareImageFromFile, prepareImageFromUrl } from "@/lib/image/prepareImage";
import type {
  AccessibilityFinding,
  AnalysisStatus,
  ComparisonMode,
  ImageComment,
  LoadedImage,
  VisionCondition,
} from "@/lib/types";
import { getConditionMeta, simulateCondition } from "@/lib/vision/conditions";

export function SpectraApp() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [resized, setResized] = useState(false);
  const [condition, setCondition] = useState<VisionCondition>("normal");
  const [intensity, setIntensity] = useState(100);
  const [debouncedIntensity, setDebouncedIntensity] = useState(100);
  const [simulated, setSimulated] = useState<ImageData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("side-by-side");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [findings, setFindings] = useState<AccessibilityFinding[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "medium">("all");
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [comments, setComments] = useState<ImageComment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const previousUrl = useRef<string | null>(null);
  const analysisToken = useRef(0);
  const commentKey = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedIntensity(intensity), 80);
    return () => window.clearTimeout(timer);
  }, [intensity]);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      try {
        const next = simulateCondition(image.originalImageData, condition, debouncedIntensity);
        if (cancelled) return;
        setSimulated(next);
        setProcessError(null);
        setProcessing(false);
      } catch {
        if (cancelled) return;
        setProcessError("The simulation could not be generated for this image.");
        setProcessing(false);
      }
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [image, condition, debouncedIntensity]);

  useEffect(() => {
    if (!commentKey.current) return;
    saveComments(commentKey.current, comments);
  }, [comments]);

  const resetAnalysis = useCallback(() => {
    analysisToken.current += 1;
    setAnalysisStatus("idle");
    setFindings([]);
    setSelectedId(null);
    setFilter("all");
    setAiNotice(null);
  }, []);

  const replaceImage = useCallback(
    (next: LoadedImage, wasResized: boolean) => {
      if (previousUrl.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl.current);
      }
      previousUrl.current = next.objectUrl;
      setImage(next);
      setResized(wasResized);
      setSimulated(next.originalImageData);
      setProcessing(true);
      const key = commentStorageKey(next.fileName, next.width, next.height);
      commentKey.current = key;
      setComments(loadComments(key));
      setSelectedCommentId(null);
      setCommenting(false);
      resetAnalysis();
    },
    [resetAnalysis],
  );

  async function handleFile(file: File) {
    const prepared = await prepareImageFromFile(file);
    replaceImage(prepared.image, prepared.resized);
  }

  async function handleSample() {
    setSampleLoading(true);
    setSampleError(null);
    try {
      const prepared = await prepareImageFromUrl("/sample-dashboard.svg", "harbor-ops-sample.svg");
      replaceImage(prepared.image, prepared.resized);
    } catch (error) {
      setSampleError(error instanceof ImageLoadError ? error.message : "The sample image could not be loaded.");
    } finally {
      setSampleLoading(false);
    }
  }

  function handleConditionChange(next: VisionCondition) {
    setCondition(next);
    const meta = getConditionMeta(next);
    setIntensity(meta.defaultIntensity);
    setDebouncedIntensity(meta.defaultIntensity);
    setProcessing(true);
  }

  function handleNewImage() {
    if (previousUrl.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl.current);
    }
    previousUrl.current = null;
    setImage(null);
    setSimulated(null);
    setProcessing(false);
    setCondition("normal");
    setIntensity(100);
    setDebouncedIntensity(100);
    commentKey.current = null;
    setComments([]);
    setSelectedCommentId(null);
    setCommenting(false);
    resetAnalysis();
  }

  function handleCreateComment(x: number, y: number) {
    const next = createComment(x, y);
    setComments((current) => [...current, next]);
    setSelectedCommentId(next.id);
  }

  function handleChangeComment(updated: ImageComment) {
    setComments((current) => current.map((comment) => (comment.id === updated.id ? updated : comment)));
  }

  function handleCloseComment() {
    setComments((current) => {
      const selected = current.find((comment) => comment.id === selectedCommentId);
      if (selected && selected.body.trim().length === 0) {
        return current.filter((comment) => comment.id !== selected.id);
      }
      return current;
    });
    setSelectedCommentId(null);
  }

  function handleAnalyze() {
    if (!image || analysisStatus === "analyzing") return;
    const token = analysisToken.current + 1;
    analysisToken.current = token;
    setAnalysisStatus("analyzing");
    setSelectedId(null);
    setAiNotice(null);
    window.requestAnimationFrame(() => {
      try {
        const detected = analyzeContrast(image.originalImageData);
        if (analysisToken.current !== token) return;
        setFindings(detected);
        setAnalysisStatus("complete");
        if (detected[0]) setSelectedId(detected[0].id);
        void enrichFindings(detected).then((result) => {
          if (analysisToken.current !== token) return;
          setFindings(result.findings);
          if (result.aiUnavailable) {
            setAiNotice(
              "AI recommendations are temporarily unavailable. Accessibility measurements are still available.",
            );
          }
        });
      } catch {
        if (analysisToken.current !== token) return;
        setAnalysisStatus("idle");
        setAiNotice("Contrast analysis could not be completed for this image.");
      }
    });
  }

  async function handleExportSimulation() {
    if (!simulated) throw new Error("missing simulation");
    await exportSimulationPng(simulated, `spectra-${condition}.png`);
  }

  async function handleExportAnnotated() {
    if (!image) throw new Error("missing image");
    await exportAnnotatedPng(image.originalImageData, findings, selectedId, "spectra-annotated.png");
  }

  async function handleExportComments() {
    if (!image) throw new Error("missing image");
    await exportCommentedPng(image.originalImageData, comments, "spectra-comments.png");
  }

  return (
    <div className="flex h-dvh flex-col bg-[var(--bg)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-[13px] focus:text-[var(--text)]"
      >
        Skip to main content
      </a>
      <Header />
      {image ? (
        <Workspace
          fileName={image.fileName}
          resized={resized}
          original={image.originalImageData}
          simulated={simulated ?? image.originalImageData}
          condition={condition}
          intensity={intensity}
          processing={processing}
          processError={processError}
          comparisonMode={comparisonMode}
          sliderPosition={sliderPosition}
          analysisStatus={analysisStatus}
          findings={findings}
          selectedId={selectedId}
          filter={filter}
          aiNotice={aiNotice}
          onConditionChange={handleConditionChange}
          onIntensityChange={(value) => {
            setIntensity(value);
            setProcessing(true);
          }}
          onComparisonModeChange={setComparisonMode}
          onSliderPositionChange={setSliderPosition}
          onAnalyze={handleAnalyze}
          onSelectFinding={setSelectedId}
          onFilterChange={setFilter}
          onExportSimulation={handleExportSimulation}
          onExportAnnotated={handleExportAnnotated}
          onExportComments={handleExportComments}
          onCopyFindings={() => copyFindings(findings)}
          onNewImage={handleNewImage}
          comments={comments}
          selectedCommentId={selectedCommentId}
          commenting={commenting}
          onToggleCommenting={() => setCommenting((value) => !value)}
          onSelectComment={setSelectedCommentId}
          onCreateComment={handleCreateComment}
          onChangeComment={handleChangeComment}
          onCloseComment={handleCloseComment}
        />
      ) : (
        <EmptyState
          onFile={handleFile}
          onSample={handleSample}
          sampleLoading={sampleLoading}
          sampleError={sampleError}
        />
      )}
    </div>
  );
}
