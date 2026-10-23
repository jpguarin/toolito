// Image tool settings and pure helpers (no codecs here, so this is cheap to
// import from any page and easy to test). The codecs live in image-codecs.ts.

export type ImageFormat = "jpeg" | "png" | "webp" | "avif";
export type OutputFormat = ImageFormat | "same";

export interface WashSettings {
  format: OutputFormat;
  quality: number; // 10-100; ignored by PNG (lossless).
  resize: boolean; // Fit within MAX_SIDE (WasherControls.md: "Resize to fit 1920 px").
}

export const DEFAULT_SETTINGS: WashSettings = { format: "webp", quality: 75, resize: false };
export const MAX_SIDE = 1920;

export const MIME: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export const EXTENSION: Record<ImageFormat, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/** The washer only accepts what it can decode; GIF, HEIC, SVG… are refused. */
export function formatFromMime(mime: string): ImageFormat | null {
  const match = Object.entries(MIME).find(([, type]) => type === mime);
  return match ? (match[0] as ImageFormat) : null;
}

export function targetFormat(input: ImageFormat, setting: OutputFormat): ImageFormat {
  return setting === "same" ? input : setting;
}

/** Shrink to fit inside a max x max box, keeping the shape. Never enlarges. */
export function fitWithin(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** "beach.jpg" + webp -> "beach.webp" */
export function outputName(fileName: string, format: ImageFormat): string {
  const base = fileName.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${EXTENSION[format]}`;
}

/** LED summary on the washer (WasherControls.md): "Q75 · WEBP". */
export function settingsLabel({ format, quality }: WashSettings): string {
  const name = format === "same" ? "SAME" : EXTENSION[format].toUpperCase();
  return format === "png" ? `LOSSLESS · ${name}` : `Q${quality} · ${name}`;
}
