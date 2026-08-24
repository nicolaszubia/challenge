import { linearToSrgbChannel, srgbChannelToLinear } from "@/lib/contrast/luminance";

/**
 * Low contrast-sensitivity approximation.
 *
 * Compresses linear-RGB values toward mid-gray. This is a perceptual
 * sketch of reduced contrast sensitivity, not a clinical CSF model.
 *
 * Default UI intensity is 70%: enough to reveal low-contrast labels
 * while keeping layout structure visible.
 */
export function simulateLowContrast(source: ImageData, intensity = 1): ImageData {
  const t = Math.min(1, Math.max(0, intensity));
  if (t === 0) {
    return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
  }

  // At 100% intensity, remaining contrast is 28% of original.
  const factor = 1 - t * 0.72;
  const result = new ImageData(source.width, source.height);
  const src = source.data;
  const dst = result.data;
  const mid = 0.214041; // approximate linear luminance of sRGB 0.5

  for (let i = 0; i < src.length; i += 4) {
    const r = srgbChannelToLinear(src[i]);
    const g = srgbChannelToLinear(src[i + 1]);
    const b = srgbChannelToLinear(src[i + 2]);
    dst[i] = linearToSrgbChannel(mid + (r - mid) * factor);
    dst[i + 1] = linearToSrgbChannel(mid + (g - mid) * factor);
    dst[i + 2] = linearToSrgbChannel(mid + (b - mid) * factor);
    dst[i + 3] = src[i + 3];
  }

  return result;
}
