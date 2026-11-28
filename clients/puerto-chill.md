# Puerto Chill

Bazar y marroquinería, Washington 5502, Isidro Casanova.

- App: `apps/puerto-chill` (Fase 1, sobre los paquetes `@nexora/*`). Producción sale de nexora desde el 2026-11-28 (proyecto de Vercel `puerto-chill`, carpeta raíz `apps/puerto-chill`, solo deploya si cambia la app o sus paquetes). `neri-sw/tienda-chill` queda como histórico.
- Panel escondido: se abre en `/<ADMIN_PATH>` (variable en Vercel; la URL la tiene Neri). `/admin` da 404.
- Vercel: https://puerto-chill.vercel.app · Blob privado `puerto-chill-data`.
- Módulos: state, auth (sesión de 1 año, 5 intentos/min, sin botón de cerrar sesión), api, commerce (stock simple, ids numéricos desde 1), media, admin-sync, admin-ui, legal-ar.
- Estados de pedido: pendiente, preparando, listo, enviado, entregado, cancelado.
- Pagos: Mercado Pago (link enviado por el dueño), transferencia con descuento, efectivo solo al retirar. Sin cobro online.
- Diseño: `DESIGN.md` y `PRODUCT.md` del repo legado.
- Pendientes: clave definitiva del panel (la carga Neri en Vercel), fotos reales.
