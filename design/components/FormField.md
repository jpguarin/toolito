# FormField

Labelled inputs used inside tools: text fields (page ranges), radio groups (output options) and checkboxes.

## Text field

- Visible `<label>` above (Work Sans 800 15px), input min-height 46px, `paper` fill, `border-md` `line`, `radius-md`, text 600 16px.
- Hint below in `muted` 13px, linked with `aria-describedby`.
- Focus: `outline: 3px solid accent`, offset 2px.
- Error: border `error`, `aria-invalid="true"`, message in `error` 800 13px replacing the hint ("This PDF only has 12 pages.").

## Radio and checkbox

- Native inputs 20 × 20 with `accent-color: accent`, whole row clickable, min-height 44px.
- Radios grouped in a `<fieldset>` with a `<legend>`.

Validate as the user types but show errors only after blur or submit.
