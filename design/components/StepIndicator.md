# StepIndicator

A row of pill steps that shows where the user is in a machine's flow, used on the dryer: 1 Load · 2 Cycle · 3 Dry · 4 Take home.

- `<ol aria-label="Progress">`; the current step has `aria-current="step"`.
- Pills: `font-sign` 13px, `border-md` `line`, `radius-pill`.
- Done: `accent-2` / `on-accent-2`. Current: `panel` / `led`. Upcoming: transparent / `ink`.
- Informational only — steps are not clickable. Wraps on phones; may be hidden below 400px if space is tight (the LED already says the state).
