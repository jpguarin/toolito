import { describe, expect, test } from "vitest";

import { parseRanges } from "../lib/ranges";
import { type SplitState, splitGroups } from "./split-line";

const state = (mode: SplitState["mode"], text = "", pageCount = 12): SplitState => ({
  pageCount,
  pinned: new Set(),
  mode,
  parsed: parseRanges(text, pageCount),
});

describe("splitGroups", () => {
  test("one PDF with those pages, in the typed order", () => {
    expect(splitGroups(state("pick", "8, 1-3"), "one")).toEqual([[8, 1, 2, 3]]);
  });

  test("one PDF per range", () => {
    expect(splitGroups(state("ranges", "1-3, 8"), "per-range")).toEqual([[1, 2, 3], [8]]);
  });

  test("every page ignores the field", () => {
    expect(splitGroups(state("every", "nonsense", 3), "one")).toEqual([[1], [2], [3]]);
  });

  test("nothing to take home while the field is invalid", () => {
    expect(splitGroups(state("pick", "20"), "one")).toEqual([]);
    expect(splitGroups(state("pick", ""), "per-range")).toEqual([]);
  });
});
