# Backlog del stack

Mejoras pendientes al producto (no a un cliente puntual). Cada ítem con origen. `stack-orquestador` lo lee al empezar cada sesión.

| Prioridad | Ítem | Paquete/skill | Origen |
| --- | --- | --- | --- |
| alta | Al mergear el PR #1 (despliegue de la app de gestión): mover la app de gestión a `apps/gestion`, agregar `package.json` raíz con workspaces, y cambiar su carpeta raíz en Vercel | apps/gestion | decisión de Neri 2026-11-28 |
| alta | Extraer `state`, `auth`, `api`, `commerce`, `media`, `admin-sync` desde Puerto Chill, con tests | packages | plan Fase 1 |
| alta | Mudar Puerto Chill a `apps/puerto-chill` | apps | plan Fase 1 |
| media | Rate limit compartido entre instancias (hoy en memoria) | api | Titán y Puerto Chill |
| media | Backups diarios de `state.json` | state | plan Fase 5 |
| media | Interfaz `PaymentProvider` + Mercado Pago | payments | plan Fase 3 |
| baja | Aviso al dueño por pedido nuevo | notify | plan Fase 4 |
