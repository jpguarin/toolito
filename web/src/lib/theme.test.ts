import { describe, expect, test } from "vitest";

import { resolveTheme } from "./theme";

describe("resolveTheme", () => {
  // The boundaries are where off-by-one mistakes hide (docs/THEMES.md §7).
  test.each([
    [6, "dark"],
    [7, "light"],
    [18, "light"],
    [19, "dark"],
  ])("hour %i is %s", (hour, expected) => {
    expect(resolveTheme(hour)).toBe(expected);
  });

  test("midnight and noon", () => {
    expect(resolveTheme(0)).toBe("dark");
    expect(resolveTheme(12)).toBe("light");
  });
});
