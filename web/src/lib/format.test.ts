import { describe, expect, test } from "vitest";

import { formatBytes, plural, savingsLabel } from "./format";

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

describe("savingsLabel", () => {
  test.each([
    [3200, 900, "\u221272%"],
    [1000, 1000, "0%"],
    [1000, 1120, "+12%"],
    [0, 10, "0%"],
  ])("%i -> %i is %s", (before, after, label) => {
    expect(savingsLabel(before, after)).toBe(label);
  });

  test("uses the minus sign, not a hyphen", () => {
    expect(savingsLabel(100, 50).startsWith("-")).toBe(false);
  });
});
