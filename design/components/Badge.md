# Badge

Small non-interactive labels: savings, the machine's name above a page title, where a tool runs, and the error label.

| Variant | Example | Style |
|---|---|---|
| Savings | −72% | `ok` / `on-ok`, `font-sign` 15px, `radius-sm` |
| Machine | WASHER No.1 | `panel` / `led`, `font-sign` 14px, `border-thin` |
| Hot machine | DRYER No.3 | `hot` / `on-hot` — dryer only |
| Privacy (local) | lock icon + "Never uploaded" | `paper`, `border-thin`, Work Sans 800 13px, pill, lock icon |
| Privacy (server) | cloud icon + "Deleted after every load" | same as local, cloud icon |
| Error | OUT OF ORDER | `error` / `paper`, `font-sign` 14px |

Rules: never use a badge as a button; keep text to one to three words; the lock and cloud icons are stroke SVGs (no emoji).
