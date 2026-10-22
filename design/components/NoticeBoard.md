# NoticeBoard

Where ads live: a cork board with a pinned flyer (side column, 300 × 250) or a dashed banner slot (728 × 90 desktop, 320 × 50 mobile).

## Rules

- Ads **never** cover, push down or sit between a machine and its primary button. Place them after the result panel, in the side column, or above the footer.
- Reserve the slot's height before the ad loads (no layout shift).
- Wrap each slot in `<aside aria-label="Advertisement">` and keep the small "Advertisement" label visible.
- Cork: `cork` with a `cork-frame` border, the ad on a `note` flyer tilted 2° with an `accent` pin. Banner: `card`, `border-md` dashed `rim`, `radius-md`.
- No ads on error screens or while a machine is running.
