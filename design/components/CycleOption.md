# CycleOption

A large selectable card for choosing how hard the dryer squeezes a PDF: Delicate, Normal or Heavy duty.

## Behaviour

- A group of three `<button aria-pressed>` inside a `<fieldset>` with the legend "Pick a cycle". Exactly one is pressed; **Normal** is the default.
- Maps to the API `level`: Delicate → `low`, Normal → `recommended`, Heavy duty → `extreme` (see `docs/API.md`).

## Style

- Default: `card` fill, `border-md` in `line`, radius 16px, min-height 64px.
- Selected: `accent-2` fill, `on-accent-2` text, `shadow-press`.
- Name in `font-sign` 18px; description Work Sans 600 14px; estimate on the right in 800.

Estimates are ranges ("~50–65% off"), never promises.
