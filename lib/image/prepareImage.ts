import { drawToImageData, loadImageElement, workingDimensions } from "./loadImage";
import type { LoadedImage } from "@/lib/types";

export async function prepareImageFromUrl(src: string, fileName: string): Promise<{ image: LoadedImage; resized: boolean }> {
  const element = await loadImageElement(src);
  const dimensions = workingDimensions(element.naturalWidth || element.width, element.naturalHeight || element.height);
  const originalImageData = drawToImageData(element, dimensions.width, dimensions.height);
  return {
    resized: dimensions.resized,
    image: {
      element,
      objectUrl: src,
      width: dimensions.width,
      height: dimensions.height,
      fileName,
      originalImageData,
    },
  };
}

export async function prepareImageFromFile(file: File): Promise<{ image: LoadedImage; resized: boolean }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const prepared = await prepareImageFromUrl(objectUrl, file.name);
    return prepared;
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}
