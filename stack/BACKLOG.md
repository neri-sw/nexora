# Backlog del stack

Mejoras pendientes al producto (no a un cliente puntual). Cada ítem con origen. `stack-orquestador` lo lee al empezar cada sesión.

| Prioridad | Ítem | Paquete/skill | Origen |
| --- | --- | --- | --- |
| media | Mover la app de gestión a `apps/gestion` y cambiar su carpeta raíz en Vercel (hoy vive en la raíz; el `package.json` raíz ya combina las dos cosas y no tiene script `build` para que Vercel no compile los sitios en ese proyecto) | apps/gestion | decisión de Neri 2026-11-28 |
| baja | Archivar `neri-sw/tienda-chill` (Puerto Chill ya deploya solo desde nexora: Git reconectado por Neri el 2026-11-28 y verificado con un push) | apps/puerto-chill | 2026-11-28 |
| alta | `templates/app` a partir de `apps/puerto-chill` (sin marca ni contenido) | templates | Fase 1 |
| media | Variantes (talle, color) con stock por variante en `commerce`, para migrar Titán | commerce | Titán |
| media | `content.schema.ts` y pantalla "Textos del sitio" generada (`admin-ui`) | admin-ui | plan |
| media | Rate limit compartido entre instancias (hoy en memoria) | api | Titán y Puerto Chill |
| media | Backups diarios de `state.json` | state | plan Fase 5 |
| media | Interfaz `PaymentProvider` + Mercado Pago | payments | plan Fase 3 |
| baja | Aviso al dueño por pedido nuevo | notify | plan Fase 4 |
| media | Error de hidratación de React #418 en el panel (pestañas resumen y pedidos), probablemente fechas u horas formateadas distinto en servidor y navegador | admin-ui / apps/puerto-chill | paridad 2026-11-28 |
| baja | `/api/upload`: revisar los primeros bytes (JPG, PNG, WebP) además del `content-type` | media | paridad 2026-11-28 |
| baja | `parseRequest`: decidir si `qty` en texto (`"2"`) se rechaza; hoy se acepta | commerce | paridad 2026-11-28 |
| media | `paridad/` para Titán antes de moverlo a nexora | apps/titan-studios | paridad 2026-11-28 |
