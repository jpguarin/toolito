import { expect, test } from "vitest";

import { CONVERSIONS } from "./conversions";

test("every format to each of the other three: 12 pages", () => {
  expect(CONVERSIONS).toHaveLength(12);
});

test("slugs are unique and use the familiar extensions", () => {
  const slugs = CONVERSIONS.map((conversion) => conversion.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(slugs).toEqual(expect.arrayContaining(["jpg-to-webp", "png-to-webp", "webp-to-jpg", "png-to-jpg"]));
  expect(slugs.some((slug) => slug.includes("jpeg"))).toBe(false);
});

test("no format converts to itself", () => {
  expect(CONVERSIONS.every(({ from, to }) => from !== to)).toBe(true);
});

test("titles read the way people search", () => {
  expect(CONVERSIONS.find((c) => c.slug === "jpg-to-webp")?.title).toBe("JPG to WebP");
});
