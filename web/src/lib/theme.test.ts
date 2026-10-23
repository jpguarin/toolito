import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { resolveTheme, THEME_COLOR } from "./theme";

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

test("theme-color matches the --panel token in both themes", () => {
  const css = readFileSync(new URL("../../../design/tokens.css", import.meta.url), "utf8");
  const [light, dark] = css.split('[data-theme="dark"]');
  const panel = (block: string) => block.match(/--panel:\s*(#[0-9A-Fa-f]{6})/)?.[1];
  expect(THEME_COLOR.light).toBe(panel(light));
  expect(THEME_COLOR.dark).toBe(panel(dark));
});
