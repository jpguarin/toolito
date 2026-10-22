# Icons

17 stroke icons on a 24 × 24 grid, 2–2.6px strokes, round caps and joins. The files are drawn in `ink` (#12233D) so they read on light backgrounds when used as images.

In the product, **inline the SVG and set `stroke="currentColor"`** (or `fill` for `play`) so each icon takes its colour from the token of its context: `icon-<machine>` inside portholes, `on-accent` on primary buttons, `panel-ink` in headers. Decorative icons get `aria-hidden="true"`; icon-only buttons need an `aria-label`.

| Icon | Use |
|---|---|
| image | Washer No.1 — compress image |
| convert | Washer No.2 — convert image |
| pdf-compress | Dryer No.3 — compress PDF |
| merge | Folding table No.4 — merge PDF |
| split | Clothesline No.5 — split PDF |
| download | Take it home, per-file download |
| upload | Dropzone while dragging |
| plus | Dropzone, add another file |
| close | Remove a file, close the menu |
| check | Done state in the porthole |
| play | START DRYER |
| menu | Mobile menu button |
| lock | "Never uploaded" badge, locked PDF error |
| cloud | "Deleted after every load" badge, server notice |
| arrow-up / arrow-down | Reorder on the folding table |
| alert | Generic warning |

Never use emoji instead of these icons.
