# Puerto Chill

Bazar y marroquinería, Washington 5502, Isidro Casanova.

- App: legado en `neri-sw/tienda-chill` (Next.js 16, App Router). Se muda a `apps/puerto-chill` en la Fase 1.
- Vercel: https://puerto-chill.vercel.app · Blob privado `puerto-chill-data`.
- Módulos: state, auth (sesión de 1 año, 5 intentos/min, sin botón de cerrar sesión), api, commerce (stock simple, ids numéricos desde 1), media, admin-sync, admin-ui, legal-ar.
- Estados de pedido: pendiente, preparando, listo, enviado, entregado, cancelado.
- Pagos: Mercado Pago (link enviado por el dueño), transferencia con descuento, efectivo solo al retirar. Sin cobro online.
- Diseño: `DESIGN.md` y `PRODUCT.md` del repo legado.
- Pendientes: clave definitiva del panel (la carga Neri en Vercel), fotos reales.
