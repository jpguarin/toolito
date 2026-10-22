# Button

Pill-shaped buttons with thick outlines: one primary action per screen, a download button, a secondary button and a small icon button.

## Variants

| Variant | Use | Style |
|---|---|---|
| **Primary** | The machine's main action: START DRYER, FOLD INTO ONE, TAKE DOWN & SPLIT | `accent` fill, `on-accent` text, `border-thick` in `line`, `font-sign` 20px uppercase, height 58px, `glow-accent` at night |
| **Download** | Take it home · Take all home (ZIP) | `btn` fill, `on-btn` text, no border, Work Sans 800 17px, height 54px, download icon |
| **Secondary** | Run another load · Swap load · Rewash with new settings | transparent, `border-md` in `line`, `ink` text, Work Sans 800 16px |
| **Icon** | Per-row download, remove, move up/down | 44 × 44 circle, `border-thin` in `line`, needs `aria-label` |

All use `radius-pill`. Minimum height 44px.

## Rules

- Only **one primary** per screen.
- Never white text on `accent`.
- Disabled: `muted` text, `rim` border, no glow, `cursor: default`, and say why next to it (e.g. "Ready again in 0:42").
- Icons are 2–2.4px strokes in `currentColor`, never emoji.
