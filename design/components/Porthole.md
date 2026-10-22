# Porthole

The round machine window: a chrome rim around tinted glass with the machine's icon, used on machine cards, the big machine of a tool page and the result screens.

## Anatomy

- Circle (`radius-pill`), rim `rim` (12px on cards, 18–22px on the big machine), outer ring `0 0 0 4px` in `line`.
- Glass `glass-<machine>` with a 2px stroke icon in `icon-<machine>`.

| Machine | Glass | Icon |
|---|---|---|
| No.1 Image | `glass-image` | photo |
| No.2 Convert | `glass-convert` | two arrows |
| No.3 Dryer | `glass-dryer` | PDF with down arrow |
| No.4 Fold | `glass-fold` | two sheets |
| No.5 Sort | `glass-sort` | sheet cut by a dashed line |

## States (dryer)

- **Ready:** `glass-image`, the loaded document.
- **Drying:** `glass-dryer`, papers tumbling (rotate the content; stop with `prefers-reduced-motion`).
- **Done:** `glass-sort` with a check mark.

Sizes: 132px (home cards), 230–280px (tool page), 150px (mobile result). Always `aria-hidden` when decorative.
