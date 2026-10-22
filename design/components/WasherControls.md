# WasherControls

The washer's control panel for image settings: output format, quality and resize, with the current settings echoed on the LED.

## Parts

- Panel `panel` / `panel-ink`, `border-thick` `line`, `radius-lg` top of the machine.
- LED (`LedDisplay`) showing `Q<quality> · <FORMAT>`, `role="status"`.
- **Format pills:** Same · WebP · AVIF · JPG · PNG as `<button aria-pressed>` inside a fieldset with legend "OUTPUT FORMAT". Pressed: `led` fill with `on-accent-2` text.
- **Quality:** `<input type="range" min=10 max=100>` with a `<label>`, value in `font-sign` `led`, end hints "Smaller load" / "Crisper colors". `accent-color: accent`.
- **Resize:** checkbox "Resize to fit 1920 px".

Defaults: WebP, quality 75, resize off. Changing a setting shows "Rewash with new settings" (Secondary) under the drum.
