# CareLabel

The result of a load: a big summary of what was saved, followed by a small paper "care label" with the details.

## Parts

1. **Summary panel:** `paper`, `border-thick` in `ok`, `radius-lg`. Kicker in `font-sign` 13px `heading` ("FRESH & FOLDED" for PDF, "CLEAN LOAD" for images). Headline Work Sans 800 ~30px: "Your PDF shrank 63%" / "You saved 3.6 MB". Line in `muted`: `12.4 MB → **4.6 MB** · you saved 7.8 MB`.
2. **Care label:** `note` paper with `on-note` text (same in both themes), `border-thin`, `radius-sm`; title CARE LABEL in `font-sign` 12px; rows of label / value.

## Rows

- PDF: Cycle · Text: Still selectable · Original: Removed from the dryer.
- Images: Format · Quality · Processed on your device.
- Mobile adds "Ironing: Not needed" as a wink — optional.

Follow it with the Download button (Take it home) and a Secondary (Run another load).
