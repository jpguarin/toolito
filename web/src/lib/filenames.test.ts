import { describe, expect, test } from "vitest";

import { baseName, splitFileNames, zipName } from "./filenames";

describe("baseName", () => {
  test.each([
    ["contract.pdf", "contract"],
    ["Report.PDF", "Report"],
    ["a/b\\c.pdf", "a-b-c"],
    [".pdf", "document"],
  ])("%j -> %j", (input, expected) => {
    expect(baseName(input)).toBe(expected);
  });
});

describe("splitFileNames", () => {
  test("ranges and single pages", () => {
    expect(splitFileNames("contract.pdf", [[1, 2, 3], [8]], 12)).toEqual([
      "contract-pages-01-03.pdf",
      "contract-page-08.pdf",
    ]);
  });

  test("every page sorts correctly thanks to zero padding", () => {
    const names = splitFileNames("deck.pdf", [[2], [10]], 12);
    expect(names).toEqual(["deck-page-02.pdf", "deck-page-10.pdf"]);
    expect([...names].sort()).toEqual(names);
  });

  test("a picked set of pages in any order is a selection", () => {
    expect(splitFileNames("contract.pdf", [[8, 1, 2, 3]], 12)).toEqual(["contract-selection.pdf"]);
  });

  test("short documents need no padding", () => {
    expect(splitFileNames("memo.pdf", [[3]], 5)).toEqual(["memo-page-3.pdf"]);
  });
});

test("zipName", () => {
  expect(zipName("contract.pdf")).toBe("contract-split.zip");
});
