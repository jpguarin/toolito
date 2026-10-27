// Phones store photos with the sensor's native pixel layout and describe how to
// show them in an EXIF "Orientation" tag. jSquash decodes raw pixels and ignores
// that tag, so we read it ourselves and rotate the pixels before re-encoding.

export interface Pixels {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
}

const EXIF_ORIENTATION_TAG = 0x0112;

/** EXIF orientation of a JPEG (1-8). Returns 1 (upright) when missing or unreadable. */
export function readJpegOrientation(bytes: ArrayBuffer): number {
  const view = new DataView(bytes);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return 1;
    const marker = view.getUint8(offset + 1);
    // Start of scan / end of image: no metadata can follow.
    if (marker === 0xda || marker === 0xd9) return 1;
    const length = view.getUint16(offset + 2);
    if (marker === 0xe1 && view.getUint32(offset + 4) === 0x45786966) {
      // "Exif" + two zero bytes, then the TIFF block starts.
      return readTiffOrientation(view, offset + 10, offset + 2 + length);
    }
    offset += 2 + length;
  }
  return 1;
}

function readTiffOrientation(view: DataView, tiff: number, end: number): number {
  if (tiff + 8 > end || tiff + 8 > view.byteLength) return 1;
  const little = view.getUint16(tiff) === 0x4949; // "II" little-endian, "MM" big-endian
  const ifd = tiff + view.getUint32(tiff + 4, little);
  if (ifd + 2 > end || ifd + 2 > view.byteLength) return 1;

  const entries = view.getUint16(ifd, little);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end || entry + 12 > view.byteLength) return 1;
    if (view.getUint16(entry, little) === EXIF_ORIENTATION_TAG) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

/** Returns the pixels as they should be displayed, given an EXIF orientation (1-8). */
export function applyOrientation(image: Pixels, orientation: number): Pixels {
  if (orientation < 2 || orientation > 8) return image;

  const { width: w, height: h } = image;
  const swapped = orientation >= 5; // 5-8 are quarter turns: width and height trade places
  const outW = swapped ? h : w;
  const outH = swapped ? w : h;
  const out = new Uint8ClampedArray(image.data.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [nx, ny] = destination(orientation, x, y, w, h);
      const from = (y * w + x) * 4;
      const to = (ny * outW + nx) * 4;
      out[to] = image.data[from];
      out[to + 1] = image.data[from + 1];
      out[to + 2] = image.data[from + 2];
      out[to + 3] = image.data[from + 3];
    }
  }
  return { data: out, width: outW, height: outH };
}

/** Where the source pixel (x, y) lands in the upright image. */
function destination(orientation: number, x: number, y: number, w: number, h: number): [number, number] {
  switch (orientation) {
    case 2: return [w - 1 - x, y]; // mirrored horizontally
    case 3: return [w - 1 - x, h - 1 - y]; // rotated 180°
    case 4: return [x, h - 1 - y]; // mirrored vertically
    case 5: return [y, x]; // transposed
    case 6: return [h - 1 - y, x]; // rotate 90° clockwise (typical iPhone portrait)
    case 7: return [h - 1 - y, w - 1 - x]; // transverse
    default: return [y, w - 1 - x]; // 8: rotate 90° counter-clockwise
  }
}
