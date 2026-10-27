import { describe, expect, test } from "vitest";

import { applyOrientation, readJpegOrientation, type Pixels } from "./exif-orientation";

/** Minimal JPEG header: SOI + APP1 Exif with a single Orientation entry. */
function jpegWithOrientation(value: number, little = true): ArrayBuffer {
  const bytes = new Uint8Array(2 + 2 + 2 + 6 + 8 + 2 + 12 + 4);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0xffd8);
  view.setUint16(2, 0xffe1);
  view.setUint16(4, bytes.length - 4);
  view.setUint32(6, 0x45786966); // "Exif"
  const tiff = 12;
  view.setUint16(tiff, little ? 0x4949 : 0x4d4d);
  view.setUint16(tiff + 2, 0x002a, little);
  view.setUint32(tiff + 4, 8, little);
  view.setUint16(tiff + 8, 1, little); // one IFD entry
  view.setUint16(tiff + 10, 0x0112, little);
  view.setUint16(tiff + 12, 3, little); // type SHORT
  view.setUint32(tiff + 14, 1, little);
  view.setUint16(tiff + 18, value, little);
  return bytes.buffer;
}

describe("readJpegOrientation", () => {
  test.each([1, 3, 6, 8])("reads %i (little-endian)", (value) => {
    expect(readJpegOrientation(jpegWithOrientation(value))).toBe(value);
  });

  test("reads big-endian EXIF", () => {
    expect(readJpegOrientation(jpegWithOrientation(6, false))).toBe(6);
  });

  test("falls back to upright for non-JPEG, empty or invalid values", () => {
    expect(readJpegOrientation(new ArrayBuffer(0))).toBe(1);
    expect(readJpegOrientation(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer)).toBe(1);
    expect(readJpegOrientation(jpegWithOrientation(9))).toBe(1);
  });
});

// A 2x3 image (width 2, height 3). Each pixel's red channel is its label:
//   1 2
//   3 4
//   5 6
const source: Pixels = {
  width: 2,
  height: 3,
  data: new Uint8ClampedArray([1, 2, 3, 4, 5, 6].flatMap((n) => [n, 0, 0, 255])),
};

function labels(image: Pixels): number[] {
  return Array.from({ length: image.width * image.height }, (_, i) => image.data[i * 4]);
}

describe("applyOrientation", () => {
  test.each([
    [1, 2, 3, [1, 2, 3, 4, 5, 6]],
    [2, 2, 3, [2, 1, 4, 3, 6, 5]],
    [3, 2, 3, [6, 5, 4, 3, 2, 1]],
    [4, 2, 3, [5, 6, 3, 4, 1, 2]],
    [5, 3, 2, [1, 3, 5, 2, 4, 6]],
    [6, 3, 2, [5, 3, 1, 6, 4, 2]], // iPhone portrait: rotate 90° clockwise
    [7, 3, 2, [6, 4, 2, 5, 3, 1]],
    [8, 3, 2, [2, 4, 6, 1, 3, 5]],
  ])("orientation %i -> %ix%i %j", (orientation, width, height, expected) => {
    const result = applyOrientation(source, orientation);
    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(labels(result)).toEqual(expected);
  });
});
