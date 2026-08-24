import type { VisionCondition } from "@/lib/types";
import {
  simulateAchromatopsia,
  simulateDeuteranopia,
  simulateProtanopia,
  simulateTritanopia,
} from "./simulate";
import { simulateLowAcuity } from "./simulateLowAcuity";
import { simulateLowContrast } from "./simulateLowContrast";

export type ConditionMeta = {
  id: VisionCondition;
  label: string;
  shortLabel: string;
  description: string;
  supportsIntensity: boolean;
  defaultIntensity: number;
};

export const VISION_CONDITIONS: ConditionMeta[] = [
  {
    id: "normal",
    label: "Normal vision",
    shortLabel: "Original",
    description: "No transformation. Use this as the reference.",
    supportsIntensity: false,
    defaultIntensity: 100,
  },
  {
    id: "protanopia",
    label: "Protanopia",
    shortLabel: "Protanopia",
    description: "Approximation of red-cone absence.",
    supportsIntensity: true,
    defaultIntensity: 100,
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia",
    shortLabel: "Deuteranopia",
    description: "Approximation of green-cone absence.",
    supportsIntensity: true,
    defaultIntensity: 100,
  },
  {
    id: "tritanopia",
    label: "Tritanopia",
    shortLabel: "Tritanopia",
    description: "Approximation affecting blue/yellow differentiation.",
    supportsIntensity: true,
    defaultIntensity: 100,
  },
  {
    id: "achromatopsia",
    label: "Achromatopsia",
    shortLabel: "Achromatopsia",
    description: "Approximation of severely reduced color perception.",
    supportsIntensity: true,
    defaultIntensity: 100,
  },
  {
    id: "low-acuity",
    label: "Low visual acuity",
    shortLabel: "Low acuity",
    description: "Controlled blur approximating reduced visual acuity.",
    supportsIntensity: true,
    // 55% keeps layout readable while degrading small text.
    defaultIntensity: 55,
  },
  {
    id: "low-contrast",
    label: "Low contrast sensitivity",
    shortLabel: "Low contrast",
    description: "Reduces perceived contrast while preserving structure.",
    supportsIntensity: true,
    // 70% is a useful design-review setting; 100% washes the image out.
    defaultIntensity: 70,
  },
];

export function getConditionMeta(id: VisionCondition): ConditionMeta {
  const match = VISION_CONDITIONS.find((item) => item.id === id);
  if (!match) {
    throw new Error(`Unknown vision condition: ${id}`);
  }
  return match;
}

export function simulateCondition(
  source: ImageData,
  condition: VisionCondition,
  intensity: number,
): ImageData {
  const t = intensity / 100;
  switch (condition) {
    case "normal":
      return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
    case "protanopia":
      return simulateProtanopia(source, t);
    case "deuteranopia":
      return simulateDeuteranopia(source, t);
    case "tritanopia":
      return simulateTritanopia(source, t);
    case "achromatopsia":
      return simulateAchromatopsia(source, t);
    case "low-acuity":
      return simulateLowAcuity(source, t);
    case "low-contrast":
      return simulateLowContrast(source, t);
    default: {
      const exhaustive: never = condition;
      throw new Error(`Unhandled condition: ${exhaustive}`);
    }
  }
}
