# MobileHeader

The phone version of ShopHeader (below 600px): a 20px awning strip, the TOOLITO logo and a menu button. There is no theme control.

## Anatomy

- Awning strip: stripes 44px wide.
- Bar: `panel`, `border-md` bottom in `line`.
- Logo: `font-sign` 22px `accent` (+ `glow-sign` at night), links home.
- Menu button: 44 × 44, three-line icon in `panel-ink`, `aria-label="Open menu"`, `aria-expanded` reflects the state.

## Menu

Opens a full-width panel under the bar (`panel` background, `panel-ink` links, 56px rows): Images · PDFs · House rules, then the OPEN 24/7 and SELF-SERVICE signs at the bottom. Close with the same button or Escape; focus returns to the button.
