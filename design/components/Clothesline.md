# Clothesline

The split tool's page picker: every page hangs from a line with a clothes-pin; pinned pages go in the basket.

## Anatomy

- Container `paper`, `border-thick`, `radius-lg`.
- Grid `repeat(auto-fill, minmax(110px, 1fr))`, column-gap 0 so each row's `line` (4px top border on every cell) reads as one continuous rope; row-gap 26px.
- Page: a `<button aria-pressed>` 130px tall, `note` paper (real page thumbnail when available), slight random tilt (−2° to 2°), page number in `font-sign`.
- Pin: 12 × 26 tab above the page — `rim` when unpinned, `accent` when pinned.
- Pinned page: border `heading`, ring `0 0 0 3px accent`.

## Behaviour

- Tap or Space toggles a page; `aria-label="Page 3, pinned"`.
- Shift-click selects a range.
- The basket shows the selection as ranges ("1-3, 8") in a FormField that can also be typed into; both stay in sync.
- Modes in SegmentedTabs: Pick pages · Ranges · Every page.
