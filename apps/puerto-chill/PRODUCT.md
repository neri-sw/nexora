# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + Tailwind CSS v4, chosen by the user. No backend: demo data lives in the browser (localStorage) so admin changes show up in the public storefront. Deploy target: Vercel (inferred, not confirmed).

## Users

- **Shoppers** (public storefront): people from Isidro Casanova / La Matanza and the rest of Argentina browsing bazar items and bags/purses on their phone or desktop, adding them to a cart and closing a purchase with pickup at the shop or shipping.
- **Shop owner** (admin panel): runs Puerto Chill and needs to update prices, stock, visibility, shipping/financing options and site copy without touching code, and see incoming orders.

## Product Purpose

A demo online store for Puerto Chill, "Bazar y marroquinería". This build is a structural and visual skeleton: there is no real payment, backend or business logic. Success means the owner can see how the real store would look and work end to end.

## Positioning

A physical neighborhood shop (Washington 5502, Isidro Casanova) that also sells online: buy online, pick up at the shop, or get it shipped anywhere in the country. Personal curation ("elegidos para vos") over catalog size.

## Operating Context

- Home page is a selector between the public storefront and the admin panel (requested by the user).
- Checkout options seen in the source PDF: pickup at the shop or shipping; Mercado Pago (simulated). Orders placed in the demo show up in the admin.
- Categories: Bazar; Bolsos y carteras.

## Capabilities and Constraints

- Storefront: search, category filters, product cards, cart, checkout form, test order confirmation.
- Admin: products (price, stock, visibility), orders and status, free shipping and financing (cuotas) options, site copy.
- All money in ARS. Prices in the PDF are marked "Precio ilustrativo"; they are not real prices.
- Every transaction is clearly labeled as a demo.

## Brand Commitments

- Name: Puerto Chill. Tagline seen: "Objetos que te acompañan", "Tu estilo, dentro y fuera de casa.", "Pequeños detalles, grandes momentos."
- Voice: Rioplatense Spanish with voseo ("Descubrí", "Visitá"), warm, short, close.
- Visual identity from the PDF (binding per user: "explotar la identidad que ya generó"): warm cream/sand grounds, olive green actions, serif display headings, sans body. Since Nov 2026 the shop has a circular logo (cream seal, anchor, olive "Puerto", terracotta script "Chill", "Bolsos · Bazar · Home deco"); bands moved from petrol blue to deep forest green and terracotta became the accent to match it.

## Evidence on Hand

- `public/products/bolso-urbano-negro.png`, `public/products/cartera-negra-tachas.png`: low-resolution product photos taken from the source PDF (they carry text overlays). Swap them for real photos.
- Logo: `src/assets/logo-puerto-chill.png` (also the favicon, app icons and share image).
- No shop-interior photo, no photos for the bazar products: the build uses authored illustrations as stand-ins. Do not invent reviews, customer counts or press.

## Product Principles

1. The shop comes first: the online store extends a real neighborhood shop, so pickup, the address and the human contact are always visible.
2. Clear and honest: demo prices and payments are always labeled as such.
3. The owner works without friction: every editable value in the admin shows up right away in the storefront.
4. Mobile first for shoppers; desktop is fine for the admin.
