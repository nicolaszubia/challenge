export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_DIMENSION = 8192;
export const MAX_WORKING_PIXELS = 3_500_000;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

export class ImageLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageLoadError";
  }
}

export function validateImageFile(file: File): void {
  const typeOk = ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number]);
  const name = file.name.toLowerCase();
  const extensionOk = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!typeOk && !extensionOk) {
    throw new ImageLoadError("Use a PNG, JPG, or WebP screenshot.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageLoadError("That file is larger than 10 MB. Try a smaller screenshot.");
  }
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageLoadError("This image could not be read. It may be damaged."));
    image.src = src;
  });
}

export function drawToImageData(image: CanvasImageSource, width: number, height: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new ImageLoadError("Canvas is unavailable in this browser.");
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  try {
    return context.getImageData(0, 0, width, height);
  } catch {
    throw new ImageLoadError("The image could not be processed.");
  }
}

export function workingDimensions(
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number; resized: boolean } {
  if (sourceWidth < 8 || sourceHeight < 8) {
    throw new ImageLoadError("That image is too small to analyze.");
  }

  let width = sourceWidth;
  let height = sourceHeight;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const pixels = width * height;
  if (pixels > MAX_WORKING_PIXELS) {
    const scale = Math.sqrt(MAX_WORKING_PIXELS / pixels);
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
    while (width * height > MAX_WORKING_PIXELS && width > 1 && height > 1) {
      if (width >= height) width -= 1;
      else height -= 1;
    }
  }

  return {
    width,
    height,
    resized: width !== sourceWidth || height !== sourceHeight,
  };
}
