// Theme rule (docs/THEMES.md): Light from 07:00 to 18:59, Dark from 19:00 to 06:59,
// using the visitor's local time. There is no theme toggle and nothing is saved.

export const DAY_START = 7;
export const NIGHT_START = 19;

export type Theme = "light" | "dark";

export function resolveTheme(hour: number): Theme {
  return hour >= DAY_START && hour < NIGHT_START ? "light" : "dark";
}

// Browser bar colour per theme (docs/THEMES.md §6): the --panel token's values.
// theme.test.ts checks they still match design/tokens.css.
export const THEME_COLOR: Record<Theme, string> = { light: "#12233D", dark: "#070B1C" };
