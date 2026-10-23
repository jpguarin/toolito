import { describe, expect, test } from "vitest";

import { fitWithin, formatFromMime, outputName, settingsLabel, targetFormat } from "./image";

describe("formatFromMime", () => {
  test.each([
    ["image/jpeg", "jpeg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
    ["image/gif", null],
    ["image/heic", null],
    ["", null],
  ])("%j -> %j", (mime, format) => {
    expect(formatFromMime(mime)).toBe(format);
  });
});

test("targetFormat keeps the input format for 'same'", () => {
  expect(targetFormat("png", "same")).toBe("png");
  expect(targetFormat("png", "webp")).toBe("webp");
});

describe("fitWithin", () => {
  test("shrinks the long side to the limit and keeps the shape", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1920, height: 1440 });
    expect(fitWithin(1000, 3000)).toEqual({ width: 640, height: 1920 });
  });

  test("never enlarges small images", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("outputName", () => {
  test.each([
    ["beach-sunset.jpg", "webp", "beach-sunset.webp"],
    ["logo.final.png", "avif", "logo.final.avif"],
    ["photo", "jpeg", "photo.jpg"],
  ] as const)("%s as %s -> %s", (name, format, expected) => {
    expect(outputName(name, format)).toBe(expected);
  });
});

test("settingsLabel matches the LED on the washer", () => {
  expect(settingsLabel({ format: "webp", quality: 75, resize: false })).toBe("Q75 · WEBP");
  expect(settingsLabel({ format: "png", quality: 75, resize: false })).toBe("LOSSLESS · PNG");
  expect(settingsLabel({ format: "same", quality: 60, resize: true })).toBe("Q60 · SAME");
});
