/**
 * WCAG relative luminance for sRGB colors.
 *
 * Source: WCAG 2.2, relative luminance definition
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 *
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are linearized sRGB channels.
 */

export function srgbChannelToLinear(channel8bit: number): number {
  const csrgb = channel8bit / 255;
  if (csrgb <= 0.04045) {
    return csrgb / 12.92;
  }
  return ((csrgb + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgbChannel(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  const encoded = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, encoded * 255)));
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
