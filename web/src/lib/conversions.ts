// One page per format pair (/jpg-to-webp, /png-to-jpg…): people search for the
// exact conversion, so each pair gets its own URL, title and description.
import { ALL_FORMATS, EXTENSION, FORMAT_LABEL, type ImageFormat } from "./image";

export interface Conversion {
  slug: string; // "jpg-to-webp"
  from: ImageFormat;
  to: ImageFormat;
  title: string; // "JPG to WebP"
}

// Why someone converts *to* each format, in one short phrase.
export const TARGET_REASON: Record<ImageFormat, string> = {
  webp: "smaller files that every modern browser shows",
  avif: "the smallest files modern browsers can show",
  jpeg: "photos that open everywhere, on any device",
  png: "lossless images that keep transparency",
};

export const CONVERSIONS: Conversion[] = ALL_FORMATS.flatMap((from) =>
  ALL_FORMATS.filter((to) => to !== from).map((to) => ({
    slug: `${EXTENSION[from]}-to-${EXTENSION[to]}`,
    from,
    to,
    title: `${FORMAT_LABEL[from]} to ${FORMAT_LABEL[to]}`,
  })),
);
