/**
 * Linear interpolation between original and simulated pixel buffers.
 *
 * output = original * (1 - intensity) + simulated * intensity
 *
 * Used for conditions that do not have a native severity model, and as a
 * generic blend when a full-strength simulation has already been computed.
 * Intensity is a simulation control, not a clinical measure.
 */
export function interpolateImageData(
  original: ImageData,
  simulated: ImageData,
  intensity: number,
): ImageData {
  if (original.width !== simulated.width || original.height !== simulated.height) {
    throw new Error("Image dimensions must match for interpolation.");
  }

  const t = Math.min(1, Math.max(0, intensity));
  if (t === 0) return cloneImageData(original);
  if (t === 1) return cloneImageData(simulated);

  const result = new ImageData(original.width, original.height);
  const o = original.data;
  const s = simulated.data;
  const out = result.data;
  const inv = 1 - t;

  for (let i = 0; i < o.length; i += 4) {
    out[i] = o[i] * inv + s[i] * t;
    out[i + 1] = o[i + 1] * inv + s[i + 1] * t;
    out[i + 2] = o[i + 2] * inv + s[i + 2] * t;
    out[i + 3] = o[i + 3];
  }

  return result;
}

export function cloneImageData(source: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
}
