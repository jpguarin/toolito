import { describe, expect, test } from "vitest";

import { formatRanges, pagesOf, parseRanges } from "./ranges";

describe("parseRanges", () => {
  test("single pages and ranges", () => {
    expect(parseRanges("1-3, 8", 12)).toEqual({
      ok: true,
      ranges: [
        { start: 1, end: 3 },
        { start: 8, end: 8 },
      ],
    });
  });

  test("spaces anywhere are fine", () => {
    expect(parseRanges(" 1 - 3 ,8 ", 12)).toEqual(parseRanges("1-3,8", 12));
  });

  test("the last page is allowed", () => {
    expect(parseRanges("12", 12).ok).toBe(true);
  });

  test.each([
    ["", "Pick at least one page."],
    [" , ", "Pick at least one page."],
    ["abc", "Use page numbers like 1-3, 8."],
    ["1--3", "Use page numbers like 1-3, 8."],
    ["0", "Use page numbers like 1-3, 8."],
    ["3-1", "Range 3-1 goes backwards. Try 1-3."],
    ["13", "This PDF only has 12 pages."],
    ["10-13", "This PDF only has 12 pages."],
  ])("%j -> %s", (text, error) => {
    expect(parseRanges(text, 12)).toEqual({ ok: false, error });
  });

  test("one-page PDFs say 'page'", () => {
    expect(parseRanges("2", 1)).toEqual({ ok: false, error: "This PDF only has 1 page." });
  });
});

describe("pagesOf", () => {
  test("keeps the typed order and drops repeats", () => {
    const result = parseRanges("8, 1-3, 2", 12);
    expect(result.ok && pagesOf(result.ranges)).toEqual([8, 1, 2, 3]);
  });
});

describe("formatRanges", () => {
  test.each([
    [[1, 2, 3, 8], "1-3, 8"],
    [[8, 3, 1, 2], "1-3, 8"],
    [[5], "5"],
    [[1, 3, 5], "1, 3, 5"],
    [[], ""],
  ])("%j -> %j", (pages, text) => {
    expect(formatRanges(pages)).toBe(text);
  });

  test("round trip: format then parse gives the same pages", () => {
    const text = formatRanges([1, 2, 3, 8, 9, 12]);
    const result = parseRanges(text, 12);
    expect(result.ok && pagesOf(result.ranges)).toEqual([1, 2, 3, 8, 9, 12]);
  });
});
