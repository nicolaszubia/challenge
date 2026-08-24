import { linearToSrgbChannel, srgbChannelToLinear } from "@/lib/contrast/luminance";
import { applyMatrix, getDeuteranopiaMatrix, getProtanopiaMatrix, getTritanopiaMatrix } from "./matrices";

function transformPixels(
  source: ImageData,
  mapLinear: (r: number, g: number, b: number) => [number, number, number],
): ImageData {
  const result = new ImageData(source.width, source.height);
  const src = source.data;
  const dst = result.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = srgbChannelToLinear(src[i]);
    const g = srgbChannelToLinear(src[i + 1]);
    const b = srgbChannelToLinear(src[i + 2]);
    const [nr, ng, nb] = mapLinear(r, g, b);
    dst[i] = linearToSrgbChannel(nr);
    dst[i + 1] = linearToSrgbChannel(ng);
    dst[i + 2] = linearToSrgbChannel(nb);
    dst[i + 3] = src[i + 3];
  }

  return result;
}

/**
 * Approximation of red-cone absence (protanopia) via Machado et al. 2009.
 * Intensity 0 = original, 1 = full dichromacy matrix.
 */
export function simulateProtanopia(source: ImageData, intensity = 1): ImageData {
  const matrix = getProtanopiaMatrix(intensity);
  return transformPixels(source, (r, g, b) => applyMatrix(matrix, r, g, b));
}

/**
 * Approximation of green-cone absence (deuteranopia) via Machado et al. 2009.
 */
export function simulateDeuteranopia(source: ImageData, intensity = 1): ImageData {
  const matrix = getDeuteranopiaMatrix(intensity);
  return transformPixels(source, (r, g, b) => applyMatrix(matrix, r, g, b));
}

/**
 * Approximation affecting blue/yellow differentiation (tritanopia)
 * via Machado et al. 2009.
 */
export function simulateTritanopia(source: ImageData, intensity = 1): ImageData {
  const matrix = getTritanopiaMatrix(intensity);
  return transformPixels(source, (r, g, b) => applyMatrix(matrix, r, g, b));
}

/**
 * Achromatopsia approximation: replace each pixel with its WCAG relative
 * luminance, encoded back to sRGB. This is a grayscale model of severely
 * reduced color perception, not a medical simulation of rod-only vision.
 */
export function simulateAchromatopsia(source: ImageData, intensity = 1): ImageData {
  const t = Math.min(1, Math.max(0, intensity));
  return transformPixels(source, (r, g, b) => {
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return [r + (y - r) * t, g + (y - g) * t, b + (y - b) * t];
  });
}

export { simulateLowAcuity } from "./simulateLowAcuity";
export { simulateLowContrast } from "./simulateLowContrast";
