/**
 * Low visual acuity approximation using a separable Gaussian blur.
 *
 * This is a controlled optical blur, not a clinical acuity model.
 * Default intensity in the UI is 55% so typical UI chrome remains
 * recognizable while small text degrades — 100% would be unusable
 * as a design-review tool.
 *
 * Radius scales with image size so the effect is comparable across
 * screenshots of different resolutions.
 */
export function simulateLowAcuity(source: ImageData, intensity = 1): ImageData {
  const t = Math.min(1, Math.max(0, intensity));
  if (t === 0) {
    return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
  }

  const minDim = Math.min(source.width, source.height);
  const radius = Math.max(0.6, t * minDim * 0.012);
  return gaussianBlur(source, radius);
}

function gaussianKernel(radius: number): number[] {
  const sigma = radius / 2;
  const size = Math.max(3, Math.ceil(radius) * 2 + 1);
  const half = Math.floor(size / 2);
  const kernel = new Array<number>(size);
  let sum = 0;
  for (let i = 0; i < size; i += 1) {
    const x = i - half;
    const value = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = value;
    sum += value;
  }
  return kernel.map((value) => value / sum);
}

function gaussianBlur(source: ImageData, radius: number): ImageData {
  const { width, height, data } = source;
  const kernel = gaussianKernel(radius);
  const half = Math.floor(kernel.length / 2);
  const temp = new Float32Array(width * height * 4);
  const out = new ImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let k = 0; k < kernel.length; k += 1) {
        const sx = Math.min(width - 1, Math.max(0, x + k - half));
        const idx = (y * width + sx) * 4;
        const w = kernel[k];
        r += data[idx] * w;
        g += data[idx + 1] * w;
        b += data[idx + 2] * w;
        a += data[idx + 3] * w;
      }
      const idx = (y * width + x) * 4;
      temp[idx] = r;
      temp[idx + 1] = g;
      temp[idx + 2] = b;
      temp[idx + 3] = a;
    }
  }

  const dst = out.data;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let k = 0; k < kernel.length; k += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + k - half));
        const idx = (sy * width + x) * 4;
        const w = kernel[k];
        r += temp[idx] * w;
        g += temp[idx + 1] * w;
        b += temp[idx + 2] * w;
        a += temp[idx + 3] * w;
      }
      const idx = (y * width + x) * 4;
      dst[idx] = r;
      dst[idx + 1] = g;
      dst[idx + 2] = b;
      dst[idx + 3] = a;
    }
  }

  return out;
}
