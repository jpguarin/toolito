# Toast

A small card pinned to the bottom of the screen that offers one thing at a time: keep Toolito on the home screen, or load a new version. It always has a way out and never blocks a machine for good.

## Variants

| Variant | Title | Text | Actions |
|---|---|---|---|
| **Install (Android)** | Keep Toolito at home | Add it to your home screen and it opens like an app, even offline. | Add to home screen (primary) · Not now |
| **Install (iPhone)** | Keep Toolito at home | Tap the Share button, then "Add to Home Screen". | Got it |
| **Update** | A fresh cycle is ready | Update Toolito to get the latest version. | Update (primary) · Later |

The iPhone can't be installed from code, so that variant only explains the steps.

## Style

`card`, `border-md` `line`, radius `radius-md`, padding 16, gap 12, `shadow-press`. Title Work Sans 800 15px (`label`), text 13px `muted` (`caption`). Buttons follow Button.md: the primary one is the **Download** style (`btn` / `on-btn`, pill, min height 44px), the other is **Secondary** (transparent, `border-md`).

Phones: full width minus the page gutter (24px) and 16px from the bottom edge. From the `wide` breakpoint up: right-aligned, `container-lead` max width.

## Rules

- One toast at a time. An update replaces an install offer.
- Only on touch devices, never when the app is already installed (`display-mode: standalone`).
- Wait a few seconds after load so it doesn't greet people before the page does.
- Closing the install offer hides it for the rest of the session (`sessionStorage`); nothing is stored longer.
- `role="status"` with `aria-live="polite"`: announced, never steals focus. Buttons are real `<button>`s and the toast leaves with the Escape key.
- No text on `accent`; no icons besides the ones in `icons/`.
