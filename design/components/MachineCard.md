# MachineCard

A tool shown as a laundromat machine on the home page: control panel with number and LED tag, a porthole, the tool name and where it runs.

## Anatomy

1. **Control panel:** `panel` / `panel-ink`, machine number in `font-sign` 18px, LED tag (`led-bg` / `led`, `sign-sm`).
2. **Porthole:** see Porthole, 132px on the home page.
3. **Text:** tool name Work Sans 800 19px `ink`; one line in `muted` saying the cycle and where it runs ("your device" or "emptied after every cycle").

Body `surface`, `border-thick` `line`, `radius-lg`. The whole card is one link.

## The dryer

The PDF compressor is the only server tool, so it is the **hot** machine: body `paper`, border and panel `hot`, text `on-hot`, LED tag in `hot`, and `shadow-hot`. Use the hot style for nothing else.

## Content

| No. | Tag | Title | Line |
|---|---|---|---|
| 1 | IMG | Compress image | Gentle cycle · your device |
| 2 | DYE | Convert image | Change colors… er, formats |
| 3 | DRYER | Compress PDF | Heavy loads · emptied after every cycle |
| 4 | FOLD | Merge PDF | Fold them into one pile |
| 5 | SORT | Split PDF | Sort the pages you need |

Lay them out in a grid of `repeat(auto-fit, minmax(200px, 1fr))` with `gap` 20px.
