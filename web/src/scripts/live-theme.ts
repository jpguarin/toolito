// Keeps the theme in sync with the clock while the page stays open
// (docs/THEMES.md §3). The first choice happens in BaseLayout's inline script.
import { resolveTheme, type Theme } from "../lib/theme";

const CHECK_EVERY_MS = 60_000;
const TRANSITION_MS = 400; // Matches the CSS transition in global.css.

function forcedTheme(): Theme | null {
  const forced = new URLSearchParams(location.search).get("theme");
  return forced === "light" || forced === "dark" ? forced : null;
}

function applyClockTheme(): void {
  const root = document.documentElement;
  const theme = resolveTheme(new Date().getHours());
  if (root.dataset.theme === theme) return;

  // Mark the switch so colors fade only now, not on every hover or click.
  root.dataset.themeChanging = "";
  root.dataset.theme = theme;
  window.setTimeout(() => delete root.dataset.themeChanging, TRANSITION_MS);
}

// A test theme (?theme=light|dark) stays fixed: the clock never overrides it.
if (!forcedTheme()) {
  window.setInterval(applyClockTheme, CHECK_EVERY_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") applyClockTheme();
  });
}
