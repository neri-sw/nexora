---
name: qa-e2e
description: Verificación al cerrar cada iteración: tests de reglas de los paquetes y recorrido completo en el navegador con Blob simulado.
---

# qa-e2e

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Al cerrar cada iteración y antes de cada merge a `main`.

## Pasos

1. `npm run check`.
2. Playwright contra la app con mock de `@vercel/blob`: login del panel, alta de producto, pedido desde la tienda, pedido visible en el panel, cambio de estado, foto subida.
3. Repetí el recorrido en preview real si el cambio toca persistencia.

## Errores conocidos

- El rate limit de pedidos vive en memoria: reiniciá el server entre corridas o los pedidos fallan con 429.
- Si un test de pedido falla con 409 sin conflicto real, revisá el ETag débil (ver `backend-estado`).
