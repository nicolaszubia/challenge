export type VisionCondition =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"
  | "low-acuity"
  | "low-contrast";

export type ComparisonMode = "side-by-side" | "slider";

export type AnalysisStatus = "idle" | "analyzing" | "complete";

export type FindingSeverity = "high" | "medium";

export type FindingType = "contrast";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type AccessibilityFinding = {
  id: string;
  type: FindingType;
  title: string;
  severity: FindingSeverity;
  contrastRatio: number;
  requiredRatio: number;
  foregroundColor: string;
  backgroundColor: string;
  suggestedForegroundColor?: string;
  bounds: BoundingBox;
  whyItMatters: string;
  recommendation: string;
  source: "deterministic" | "ai";
};

export type LoadedImage = {
  element: HTMLImageElement;
  objectUrl: string;
  width: number;
  height: number;
  fileName: string;
  originalImageData: ImageData;
};
