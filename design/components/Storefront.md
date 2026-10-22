# Storefront

The home page hero: a full awning with a scalloped edge over the tiled floor, the big TOOLITO / LAUNDROMAT sign and the headline.

## Anatomy

- **Awning:** 48px stripes `awning-a` / `awning-b` (56px wide) + 28px scallop of half-discs in the same two colours.
- **Floor:** `bg` with `grid` lines every `tile`.
- **Sign:** `panel` box, radius 18px, 5px inner border `awning-b`, outer ring 4px `line`. "TOOLITO" `sign-xl` in `accent` (`glow-sign` at night); "LAUNDROMAT" 22px, letter-spacing 6px, `sign-sub` (`glow-led`).
- **Headline:** `display` style — "We shrink your files. On purpose."
- **Lead:** `lead` style in `muted`, max 600px.

Centered column, gap 18px. Only on the home page; inner pages use ShopHeader. The OPEN 24/7 and SELF-SERVICE signs sit in the header row above the hero.
