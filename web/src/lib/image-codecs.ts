// jSquash codecs (WebAssembly, from Squoosh). Each codec is imported only when
// a file needs it, so nobody downloads the AVIF encoder unless they pick AVIF.
// Only imported from the image worker.
import { applyOrientation, readJpegOrientation } from "./exif-orientation";
import { fitWithin, type ImageFormat, type WashSettings, targetFormat } from "./image";

export class ImageError extends Error {
  constructor(
    readonly code: "unsupported_image" | "corrupted_image",
    message: string,
  ) {
    super(message);
    this.name = "ImageError";
  }
}

async function decode(format: ImageFormat, bytes: ArrayBuffer): Promise<ImageData> {
  try {
    switch (format) {
      case "jpeg":
        return (await import("@jsquash/jpeg/decode.js")).default(bytes);
      case "png":
        return (await import("@jsquash/png/decode.js")).default(bytes);
      case "webp":
        return (await import("@jsquash/webp/decode.js")).default(bytes);
      case "avif": {
        const image = await (await import("@jsquash/avif/decode.js")).default(bytes);
        if (!image) throw new Error("Empty AVIF");
        return image;
      }
    }
  } catch {
    throw new ImageError("corrupted_image", "This image is damaged and cannot be opened.");
  }
}

async function encode(format: ImageFormat, image: ImageData, quality: number): Promise<ArrayBuffer> {
  switch (format) {
    case "jpeg":
      return (await import("@jsquash/jpeg/encode.js")).default(image, { quality });
    case "webp":
      return (await import("@jsquash/webp/encode.js")).default(image, { quality });
    case "avif":
      return (await import("@jsquash/avif/encode.js")).default(image, { quality });
    case "png":
      // PNG is lossless: OxiPNG squeezes the file without touching a pixel.
      return (await import("@jsquash/oxipng/optimise.js")).default(image, { level: 2 });
  }
}

export interface WashResult {
  bytes: ArrayBuffer;
  format: ImageFormat;
  width: number;
  height: number;
}

/** decode -> (resize) -> encode, the whole wash cycle for one image. */
export async function washImage(bytes: ArrayBuffer, input: ImageFormat, settings: WashSettings): Promise<WashResult> {
  let image = await decode(input, bytes);
  if (input === "jpeg") {
    // Phone photos are stored sideways with an EXIF tag; bake the rotation into the pixels.
    const upright = applyOrientation(image, readJpegOrientation(bytes));
    if (upright !== image) image = new ImageData(upright.data, upright.width, upright.height);
  }
  if (settings.resize) {
    const size = fitWithin(image.width, image.height);
    if (size.width !== image.width) {
      image = await (await import("@jsquash/resize")).default(image, size);
    }
  }
  const format = targetFormat(input, settings.format);
  return { bytes: await encode(format, image, settings.quality), format, width: image.width, height: image.height };
}
