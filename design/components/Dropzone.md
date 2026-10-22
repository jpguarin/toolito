# Dropzone

Where files go in: a dashed area that accepts drag-and-drop and opens the file picker on click or Enter.

## States

| State | Look | Text |
|---|---|---|
| Empty | `paper`, `border-md` **dashed** `line`, `radius-lg`, round `accent` icon with a plus | "Drop your PDF in the dryer" / "Drop images in the washer" + accepted formats and limit in `muted` |
| Drag over | solid `accent` border, `card` fill, `shadow-press`, up-arrow icon | "Let go to load it" + count |
| Compact (add more) | one row, min-height 64px | "Add more to the drum" / "Add another PDF to the table" |
| Rejected | switch to an OutOfOrder card for that file | — |

## Behaviour

- A real `<label>` wrapping a visually hidden `<input type="file">` (`accept` per tool, `multiple` except the dryer).
- Paste from clipboard also loads images.
- The whole page accepts drops while a tool page is open; the zone highlights.
- Check size and type before loading: the dryer refuses files over 30 MB here, before uploading.
