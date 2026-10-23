import { describe, expect, test } from "vitest";

import { formatBytes, plural } from "./format";

describe("formatBytes", () => {
  test.each([
    [500, "500 B"],
    [180 * 1024, "180 KB"],
    [Math.round(3.1 * 1024 * 1024), "3.1 MB"],
  ])("%i bytes is %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("plural", () => {
  test("one and many", () => {
    expect(plural(1, "page")).toBe("1 page");
    expect(plural(12, "page")).toBe("12 pages");
  });
});
