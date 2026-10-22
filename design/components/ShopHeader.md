# ShopHeader

The top of every page: a striped awning strip, the TOOLITO / LAUNDROMAT sign, the main navigation and the OPEN 24/7 and SELF-SERVICE signs.

## Anatomy

- **Awning strip:** 26px tall, stripes `awning-a` / `awning-b` every 56px. The home page uses a 48px awning plus a scalloped edge instead.
- **Bar:** `panel` background, `border-md` bottom in `line`, padding `space-3` × `space-5`.
- **Logo:** "TOOLITO" in `font-sign` 30px `accent` (+ `glow-sign` at night), "LAUNDROMAT" 12px, letter-spacing 4px, `sign-sub` (+ `glow-led`). Links to home.
- **Navigation:** Images · PDFs · House rules, Work Sans 800 15px in `panel-ink`; the current section in `accent-2` with `aria-current="page"`.
- **Signs:** OPEN 24/7 in `led` (outlined, `glow-led` at night) and SELF-SERVICE in `panel-ink`, both `sign-sm` with `border-thin` and `radius-sm`.

## Rules

- **Never put a theme switch here** (or anywhere). The theme follows the visitor's local time.
- On phones (< 600px) the navigation and signs collapse into a 44 × 44 menu button with a three-line icon in `panel-ink`; the logo stays.
- The consumer provides the links and marks the current page.
