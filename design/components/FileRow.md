# FileRow

One file in a load: thumbnail, name, sizes and the action for its current state. Used in the washer list, the dryer's loaded file and anywhere a single file is shown.

## States

| State | Right side | Middle line |
|---|---|---|
| Loaded | Secondary "Swap load" | `12.4 MB · 38 pages · loaded` |
| Washing | — (border dashed) | ProgressBar + "Spinning…" |
| Done | Savings badge + download icon button | `3.2 MB → **0.9 MB** · now WEBP` |
| Failed | remove icon button | one short reason in `error` 800 |

## Style

`card`, `border-md` `line` (dashed while working), radius 16px, padding 12 × 14, gap 16. Thumbnail 56–60px, `border-thin`, radius 10px: a real image preview for images; a `hot` "PDF" tile for PDFs. Name Work Sans 800 16px, truncated with ellipsis; details 14px `muted`, new size in `ink` bold.

Icon buttons need `aria-label` with the file name ("Download beach-sunset.jpg"). Rows wrap on phones.
