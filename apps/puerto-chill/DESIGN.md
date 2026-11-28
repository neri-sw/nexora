---
name: Puerto Chill
description: Neighborhood bazaar and leather-goods shop in Isidro Casanova; storefront and owner admin on one token set.
colors:
  paper: "#f7f3ec"
  paper-2: "#fbf9f4"
  sand: "#e8dfd0"
  sand-2: "#ddd1bd"
  linen: "#eceadf"
  line: "#ddd3c3"
  kraft: "#c9a77c"
  kraft-2: "#b48c5c"
  olive: "#58633f"
  olive-2: "#48522f"
  olive-soft: "#dfe2d0"
  forest: "#3a4128"
  forest-2: "#2e3420"
  forest-ink: "#dcdcc4"
  terra: "#a9461a"
  terra-2: "#8c3a15"
  terra-light: "#e9a77a"
  ink: "#2f2924"
  ink-2: "#5e554c"
  ink-3: "#685e54"
  danger: "#a2412c"
  danger-soft: "#f3dfd7"
typography:
  script:
    fontFamily: "Pacifico, Brush Script MT, cursive"
    fontSize: "0.86em of the headline"
    fontWeight: 400
  display:
    fontFamily: "Gelasio, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.9rem, 7vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Gelasio, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.1rem, 4vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Gelasio, Georgia, Times New Roman, serif"
    fontSize: "1.35rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"ss01\""
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.4
  tag:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\""
rounded:
  tag: "3px"
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter: "32px"
  section: "64px"
  section-lg: "96px"
  card-gap-y: "40px"
components:
  button-primary:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.olive-2}"
  button-primary-added:
    backgroundColor: "{colors.olive-soft}"
    textColor: "{colors.olive-2}"
  button-primary-disabled:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink-3}"
  button-hero:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-quiet:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-quiet-hover:
    backgroundColor: "{colors.sand-2}"
  chip-filter-active:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  tag-kraft:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "4px 10px 4px 20px"
  tag-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
  band-forest:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
  admin-nav-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.forest}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: Puerto Chill

## Overview

**Creative North Star: "The Shop Window on Washington Street"**

Puerto Chill is a real neighborhood shop, and the system is built from the things on its counter: sand and cream walls, a terracotta shop-window frame and deep forest-green bands, olive for the hand that takes your order, and kraft-paper price tags tied on with string. It continues the identity of the shop's source PDF (sand grounds, olive, a Georgia-metric serif) and, since November 2026, the shop's circular logo: a cream seal with an anchor, "Puerto" in olive and "Chill" in terracotta script. The logo replaced the provisional wordmark and moved the band color from petrol blue to Deep Forest, added Terracotta as the brand accent and the Pacifico script for one accent word per big headline.

The storefront persuades: a serif headline at shop-sign scale, an arched shop window with two shelves of hand-drawn objects, and a catalog laid out as a shelf. The admin operates: the same tokens, the same serif for page titles, but quiet panels, switches and fields, with forest reserved for the sidebar. One token set serves both; the difference is density and restraint, never a second palette.

Surfaces are flat and warm. Depth comes from tone (sand under paper, forest bands across the page) and from a few soft, ink-tinted drop shadows on physical objects (shelves, tags, the hanging address tag), not from floating cards. The PDF's tracked uppercase eyebrows above headings were deliberately dropped: headings stand on their own.

**Key Characteristics:**
- Warm paper and sand grounds; forest fills whole bands; olive is the only action color.
- Gelasio serif for every heading and price-of-the-moment; Hanken Grotesk for all UI.
- Kraft tags with a punched hole and string are the brand's badge and price gesture.
- 1px warm hairlines and 6px corners everywhere; nothing pill-shaped except counts and switches.
- Hand-drawn single-stroke icons and product art (1.6px icon stroke, 2.2px art stroke, round caps).
- Motion is ease-out-quint, short, and always yields to reduced motion.

## Colors

A warm, low-chroma shop palette taken from the logo: cream and sand neutrals, one olive action color, one deep forest structural color, terracotta as the brand accent, kraft for tags.

### Primary
- **Counter Olive** (`olive`): every primary action (Add to cart, Explorar la tienda, cart button, Crear producto), the active filter chip, switch-on, progress bars, focus rings, selection, caret. Deepens to **Olive Shade** (`olive-2`) on hover and for text on light olive. **Olive Wash** (`olive-soft`) is the confirmed "Agregado" state of an add button.

### Secondary
- **Deep Forest** (`forest`): the logo's dark olive, deepened. Never a button; it fills whole bands. Announcement bar, the closing band, the checkout summary in the cart drawer, the admin sidebar, and the browser theme color. **Forest Shade** (`forest-2`) is a recessed surface inside forest. **Sage Mist** (`forest-ink`) is body text on forest.
- **Terracotta** (`terra`): the "Chill" of the logo. The shop-window arch frame, the script accent word in the hero headline, discount tags, the on-state of the mini switch on the home selector. **Terracotta Light** (`terra-light`) is the script accent on forest bands. Never a primary action fill.

### Tertiary
- **Kraft Paper** (`kraft`): tags (sin stock, % off), the hanging address tag, the flying price tag, the admin pending-orders count. **Kraft Shelf** (`kraft-2`) is the shelf board in the shop window.

### Neutral
- **Shop Paper** (`paper`): page ground and text on dark/olive.
- **Fresh Paper** (`paper-2`): raised surfaces: header, inputs, panels, drawer, mobile menu.
- **Sand Wall** (`sand`): hero ground, footer, product image wells, quiet buttons, disabled buttons. **Sand Shade** (`sand-2`) for quiet-button hover, switch-off track, scrollbar.
- **Linen** (`linen`): the benefits strip between hero and catalog.
- **Hairline** (`line`): all 1px borders and dividers.
- **Espresso Ink** (`ink`): text and line art. **Ink Soft** (`ink-2`) secondary copy; **Ink Faint** (`ink-3`) placeholders, counts, struck prices, meta.
- **Brick** (`danger`) and **Brick Wash** (`danger-soft`): low-stock tag, invalid field border, destructive admin messages.

### Named Rules
**The One Hand Rule.** Olive is the only color that means "do this". Forest and terracotta never become a button fill; at most an outlined link sits on a forest band.

**The Whole Band Rule.** Forest is applied edge to edge (bars, bands, sidebars, summary blocks), never as a small accent or a text color on light grounds except the active admin nav label.

**The Logo Is The Wordmark Rule.** The circular logo (`src/assets/logo-puerto-chill.png`) is the only brand mark: header (56 to 64px), mobile menu, footer (96px), home selector (80px) and admin sidebar. Don't redraw it or set "Puerto Chill" in type beside it.

## Typography

**Display Font:** Gelasio (with Georgia, Times New Roman, serif)
**Body Font:** Hanken Grotesk (with ui-sans-serif, system-ui, sans-serif), stylistic set `ss01` on

**Accent Font:** Pacifico, the closest Google script to the logo's lettering. Only for the last word of the hero headline and the closing band (rendered by `ScriptAccent`), at 0.86em, in Terracotta (Terracotta Light on forest). Never for whole headings, body, buttons or prices.

**Character:** A sturdy, Georgia-metric serif that reads like a painted shop sign, paired with a friendly, open grotesk that keeps the counter work legible.

### Hierarchy
- **Display** (Gelasio 400, clamp(2.9rem, 7vw, 5.75rem), 0.98, -0.025em): the storefront hero headline only. The closing band uses clamp(2.4rem, 5.5vw, 4.5rem) and the selector clamp(2.4rem, 5vw, 4.25rem), both at about 1.02.
- **Headline** (Gelasio 400, clamp(2.1rem, 4vw, 3.25rem), 1.05, -0.02em): section headings such as the catalog. Admin page titles use Gelasio at a fixed 2.25rem, -0.015em.
- **Title** (Gelasio 400, 1.2rem mobile / 1.35rem desktop, snug): product names, drawer headings (1.9rem), fieldset legends (1.25rem), totals and admin stat values (1.5 to 1.85rem). Money that is the point of a block is set in the serif.
- **Body** (Hanken 400, 1rem, 1.5): copy; hero lead at 1.125rem relaxed, capped near 34rem. Secondary copy at 0.875rem in Ink Soft.
- **Label** (Hanken 500, 0.95rem): buttons, nav items, filter chips. Admin panel headings are Hanken 600 at 1.05rem, not serif.
- **Tag** (Hanken 600, 0.72rem, +0.02em, tabular): text inside kraft tags and count pills.

### Named Rules
**The Tabular Money Rule.** Every price, count and quantity uses tabular figures (`.tnum`).

**The Headings Stand Alone Rule.** No tracked uppercase eyebrow or kicker above a heading. The only tracked text in the system is the announcement bar's light tracking.

## Layout

A single centered container (max 80rem) with 20px gutters on mobile and 32px from the small breakpoint up. Storefront sections stack as full-bleed color bands (forest bar, sand hero, linen benefits, paper catalog, forest close, sand footer), each with its own ground rather than cards on one background. Vertical rhythm: catalog 64px, 96px on large screens; closing band 80px, 112px on large screens.

The hero is a two-column grid on large screens (1.05fr / 1fr, 64px gap) with copy bottom-aligned against the shop window; it stacks on mobile with the window below. The catalog is 2 columns on mobile and 4 on large screens, 16 to 24px column gap and 40px row gap, with 4:5 image wells. The header is sticky, translucent Fresh Paper with backdrop blur; nav collapses to a top sheet under 768px.

The admin is a fixed forest sidebar beside a paper workspace on large screens (the sidebar becomes a horizontal scroll strip on small screens); settings sit in a two-column grid of panels. The cart is a right-side drawer.

## Elevation & Depth

Flat by default with tonal layering: Fresh Paper over Sand, Sand over Paper, forest bands as the darkest plane. Shadows exist only where a physical object would cast one, and they are tinted with Espresso Ink, offset downward, with a negative spread so they read as a soft contact shadow rather than a float.

### Shadow Vocabulary
- **Shelf** (`box-shadow: 0 6px 10px -4px rgba(47,41,36,0.45)`): the kraft shelf boards.
- **Hanging tag** (`box-shadow: 0 10px 18px -10px rgba(47,41,36,0.6)`): the address tag hanging off the shop window.
- **Object on shelf** (`box-shadow: 0 14px 22px -16px rgba(47,41,36,0.6)`): a framed photo standing on a shelf.
- **Window glow** (`box-shadow: 0 30px 60px -40px rgba(122,50,18,0.75)`): terracotta-tinted base under the shop-window arch.
- **Drawer edge** (`box-shadow: -20px 0 50px -30px rgba(47,41,36,0.6)`): the cart drawer's leading edge.
- **Switch thumb** (`box-shadow: 0 1px 3px rgba(47,41,36,0.35)`).

### Named Rules
**The Cast Shadow Rule.** A shadow means "this is an object in the shop". Cards, panels, inputs and buttons stay flat with a hairline.

## Shapes

Gently softened rectangles: 6px corners on buttons, inputs, chips, image wells, panels and admin nav items; 4px on small framed media; 3px on the tag's right edge. Full rounding only for count pills, the switch, icon wells in the benefits strip, and progress bars. Borders are 1px Hairline; empty states use a dashed Hairline border.

Two signature silhouettes: the **arched shop window** (a 16rem top radius with a 10px terracotta frame and no bottom border) and the **kraft tag** (a notched left point cut by clip-path, a punched paper-colored hole, and a thin ink string curving off to the left).

## Components

### Buttons
Plain, confident, olive.
- **Shape:** gently softened (6px).
- **Primary:** Counter Olive fill, Shop Paper text, Hanken 500, 12px 16px in cards, 16px 24px in the hero with a trailing arrow that nudges 4px right on hover.
- **Hover / Focus / Active:** fill darkens to Olive Shade; press drops 1px; focus is a 2px olive outline offset 3px (sand on dark grounds).
- **Added state:** after Add to cart the button turns Olive Wash with Olive Shade text and a check for 1.5s.
- **Disabled:** Sand fill, Ink Faint text.
- **Quiet:** Sand fill, Ink text, Sand Shade on hover (filter chips at rest, "Ver todo", cuotas choices in admin).
- **On forest:** outlined in paper at 30% opacity, inverting to paper fill and forest text on hover.

### Chips (filters)
- **Style:** quiet buttons at 6px with a trailing count in 0.75rem Ink Faint.
- **State:** active is Counter Olive with paper text and a 75% paper count. The same pattern is used for admin segmented choices.

### Tag (signature)
The counter gesture. A kraft (or Brick, Olive, Fresh Paper) label with a notched left point, punched hole and string, 0.72rem semibold tabular text. Used for sold-out, discount and low-stock badges on product images. On Add to cart, a kraft price tag flies in an arc from the button to the cart (720ms, ease-out-quint) and the cart count bumps (scale 1.18, 420ms).

### Cards / Containers
- **Product card:** no box. A 4:5 Sand image well at 6px, then serif name, two-line Ink Soft description, tabular price, olive installments line, and a full-width primary button pinned to the bottom. Image scales 1.035 on hover over 700ms.
- **Panel (admin):** Fresh Paper, 1px Hairline, 6px corners, header 16px 20px with a Hairline divider, rows separated by Hairlines.
- **Shadow Strategy:** flat; see Elevation.

### Inputs / Fields
- **Style:** Fresh Paper fill, 1px Hairline, 6px corners, 10px 14px padding, Ink text, Ink Faint placeholder; optional prefix/suffix inside the field in Ink Faint.
- **Focus:** border shifts to Counter Olive, no glow; caret and accent color are olive.
- **Error:** border becomes Brick. Numeric fields commit on blur or Enter, revert on Escape.
- **Switch:** 44x24 track, Sand Shade off, Counter Olive on, Fresh Paper thumb sliding 20px with ease-out-quint.

### Navigation
- **Storefront:** sticky Fresh Paper header with the circular logo left, 0.95rem nav buttons (Ink Soft, Ink when active, Sand hover at 6px), olive cart button with a paper count pill right. Mobile: a top sheet with serif 1.5rem items divided by Hairlines.
- **Admin:** forest sidebar; items 0.95rem in Harbor Mist with icons, hover paper at 10%; active is a Shop Paper block with forest text.

### Forest Band
Full-width forest surface with Shop Paper headings and Sage Mist body, icons in Sand. Used for the announcement bar (0.8rem, +0.06em), the closing band, the cart's checkout summary and the admin sidebar.

## Do's and Don'ts

### Do:
- **Do** use Counter Olive (#58633f) for every primary action and nothing else.
- **Do** lay forest (#3a4128) as whole bands, edge to edge, and keep terracotta (#a9461a) for the arch, the script accent and discount tags.
- **Do** set headings, product names and featured totals in Gelasio 400 with negative tracking at display sizes.
- **Do** use the kraft Tag for badges and price moments, and tabular figures for all money.
- **Do** keep corners at 6px and borders at 1px Hairline (#ddd3c3).
- **Do** draw icons and product art as single round-capped strokes in Espresso Ink (1.6px icons, 2.2px art).
- **Do** animate with ease-out-quint (cubic-bezier(0.22, 1, 0.36, 1)) and keep every motion off under prefers-reduced-motion.
- **Do** give the admin the same tokens as the storefront, quieter: panels, hairlines, switches, sans panel headings.

### Don't:
- **Don't** put tracked uppercase eyebrows or kickers above headings; the PDF's eyebrows were dropped on purpose.
- **Don't** use forest or terracotta as a button fill, or kraft as a primary action.
- **Don't** set more than one script word per heading, or use the script below headline sizes.
- **Don't** add drop shadows to cards, panels, inputs or buttons; shadows belong to shelves, tags and objects.
- **Don't** introduce pill-shaped buttons or larger radii outside the shop-window arch.
- **Don't** introduce another accent beyond terracotta, a cool gray neutral, or bring back petrol blue; all neutrals are warm.
