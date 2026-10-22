# LedDisplay

A small dark display in `font-sign` that shows a machine's state or tag, always on a `panel`.

## Uses

- **State:** `READY` → `LOADING 42%` (real upload progress) → `DRYING 0:12` (elapsed time; the server reports no percentage) → `DONE`, 18px, letter-spacing 2px. Announce only phase changes to screen readers (see `docs/DRYER-FLOW.md` §9).
- **Tag:** the machine's short code (`IMG`, `DYE`, `DRYER`, `FOLD`, `SORT`) at 12px.
- **Settings:** a summary such as `Q75 · WEBP` on the washer.
- **Error code:** `E-413`, `E-415`, `E-422`, `LOCKED`, `COOLING`, `NO POWER` in `error` (cooling may use `hot`).

Background `led-bg`, text `led`, `radius-sm`, and `glow-led` as text-shadow at night. Uppercase, short, no sentences.
