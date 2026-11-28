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
2. `scripts/e2e/run.sh <app>`: cambia `@vercel/blob` por un simulador en disco (`scripts/e2e/blob-mock`), compila la app, la levanta con variables de prueba y corre `apps/<app>/e2e/*.cjs`. Al terminar restaura el paquete real. Modelo: `apps/puerto-chill/e2e/compra.cjs` (login, datos iniciales, API pública sin pedidos, pedido con precio adulterado, stock, panel, 409, fotos, honeypot).
3. Repetí el recorrido en preview real si el cambio toca persistencia.

## Errores conocidos

- El rate limit de pedidos vive en memoria: reiniciá el server entre corridas o los pedidos fallan con 429.
- Si una corrida ve datos de otra (por ejemplo `rev` mayor a 1 al empezar), quedó un `next-server` viejo escuchando en el puerto: `run.sh` corta si el puerto está ocupado.
- Si un test de pedido falla con 409 sin conflicto real, revisá el ETag débil (ver `backend-estado`).
