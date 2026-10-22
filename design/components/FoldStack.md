# FoldStack

The merge tool's folding table: PDFs as folded towels in order, with controls to reorder, and a "pile" preview of the final document.

## Rows

- `paper` row, `border-md` `line`, radius 14px. Left edge: an 18px towel stripe in the file's colour (cycle through `glass-image`, `glass-convert`, `glass-dryer`, `glass-fold`, `glass-sort`).
- Order number in `font-sign` 22px; name 800; "N pages · size" in `muted`.
- Up / down icon buttons (44px), disabled at the ends; optional remove (×).
- Drag to reorder with a visible lifted state (rotate −1°, offset shadow) **and** keyboard: arrows on a focused row move it; announce the new position.

## Table and pile

- The table: `wood` with faint plank lines, `border-thick` `line`, `radius-lg`.
- The pile: one bar per file in the same colours, top = first pages; under it "4 files · 18 pages" and the primary **FOLD INTO ONE**.
- Note: "Nothing is uploaded. The table is in your browser."
