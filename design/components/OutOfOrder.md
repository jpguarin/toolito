# OutOfOrder

An error shown as a machine with an "out of order" note taped on it: what happened, in plain words, and one way forward.

## Parts

- Machine card (`surface`, `border-thick`, radius 22px) with a panel header: machine name + error code in a LED tag (`error`).
- Porthole dimmed (glass = `surface` or a darker tint).
- Optional taped note: `tape` background, `on-note` text, `font-hand` 30px, rotated ±3–4°, `aria-hidden` (the heading says the same thing).
- Heading Work Sans 800 22px, one or two sentences in `muted`, then **one** action: a link to the right tool (Download style) or a Secondary button.

## Catalogue (matches `docs/API.md`)

| Code | Heading | Action |
|---|---|---|
| `E-413` file_too_large | This load is too heavy | Go to Split PDF |
| `LOCKED` encrypted_pdf | This basket is locked | Choose another file |
| `E-415` not_a_pdf | That's not laundry | Go to Washer No.1 |
| `COOLING` rate_limited | Machine cooling down | Ready again in 0:42 (disabled) |
| `NO POWER` offline | You're offline | Try again |
| `E-422` corrupted_pdf | This one's torn | Choose another file |
| `E-413` too_many_pages | This load is too heavy | Go to Split PDF |
| `E-504` processing_timeout | This load took too long | Go to Split PDF |
| `E-500` internal_error | Something jammed the drum | Try again |

`E-504` and `E-500` are drawn in the Out of order mockup (`mockups/TlErrors.dc.html`). Mapping from API errors: `docs/DRYER-FLOW.md` §5.

Never blame the user; never show technical details.
