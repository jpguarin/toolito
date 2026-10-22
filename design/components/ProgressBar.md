# ProgressBar

A rounded bar that fills with `accent` while a machine works.

| Size | Where | Spec |
|---|---|---|
| Large | Drying panel | 18px tall, `border-md` `line`, track `bg`, fill `accent` (+ `glow-accent` at night) |
| Small | FileRow while washing | 10px tall, `border-thin`, followed by "Spinning…" 800 13px |

- `role="progressbar"`, `aria-valuemin/max/now` and an `aria-label` naming the file or machine.
- **Determinate** while the dryer uploads (real percentage from the upload).
- **Indeterminate** while the server compresses (no percentage exists): animate a moving stripe, omit `aria-valuenow`, use `aria-valuetext="Drying"`; stop the stripe with `prefers-reduced-motion` and show "Working…".
- Pair the large bar with the LED (`LOADING 42%`, then `DRYING 0:12`) and the copy "Please don't open the door. It only takes a few seconds." Full flow: `docs/DRYER-FLOW.md`.
