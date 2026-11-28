# Backlog del stack

Mejoras pendientes al producto (no a un cliente puntual). Cada ítem con origen. `stack-orquestador` lo lee al empezar cada sesión.

| Prioridad | Ítem | Paquete/skill | Origen |
| --- | --- | --- | --- |
| alta | Al mergear el PR #1 (despliegue de la app de gestión): mover la app de gestión a `apps/gestion`, agregar `package.json` raíz con workspaces, y cambiar su carpeta raíz en Vercel | apps/gestion | decisión de Neri 2026-11-28 |
| alta | Apuntar el proyecto de Vercel de Puerto Chill a nexora (`apps/puerto-chill`) y verificar producción. Necesita OK de Neri | apps/puerto-chill | Fase 1 |
| alta | `templates/app` a partir de `apps/puerto-chill` (sin marca ni contenido) | templates | Fase 1 |
| media | Variantes (talle, color) con stock por variante en `commerce`, para migrar Titán | commerce | Titán |
| media | `content.schema.ts` y pantalla "Textos del sitio" generada (`admin-ui`) | admin-ui | plan |
| media | Rate limit compartido entre instancias (hoy en memoria) | api | Titán y Puerto Chill |
| media | Backups diarios de `state.json` | state | plan Fase 5 |
| media | Interfaz `PaymentProvider` + Mercado Pago | payments | plan Fase 3 |
| baja | Aviso al dueño por pedido nuevo | notify | plan Fase 4 |
