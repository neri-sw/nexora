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

## Paridad: al mover un sitio existente a nexora (o al cambiar un paquete que ya usa)

`scripts/paridad/run.sh <app> <carpeta-del-repo-original>` levanta las dos versiones (la original y la de `apps/<app>`) con el mismo Blob simulado y las mismas variables, y corre `apps/<app>/paridad/*.cjs` contra las dos. Tiene que terminar en `PARIDAD OK`. Modelo: `apps/puerto-chill/paridad/`:

- `api.cjs`: 104 pedidos a la API en el mismo orden (Blob vacío, login y bloqueo por intentos, datos iniciales que crea el panel, 18 pedidos inválidos, pedidos válidos con cada medio y entrega, límite de 8 pedidos, guardado del panel con 409/413, settings que deshabilitan cosas, fotos, cierre de sesión, páginas y estado final). Compara estado HTTP, `cache-control`, cookies y cuerpo, con fechas normalizadas.
- `ui.cjs`: texto, enlaces, meta y captura de cada página y de cada pestaña del panel en celu y compu; compra completa desde la interfaz; cancelar y descancelar un pedido desde el panel (stock); refresco automático del panel; errores de consola.
- Una diferencia buscada a propósito se declara en `ACEPTADAS` con su motivo. Cualquier otra es una regresión.
- Las capturas quedan en `apps/<app>/paridad-out/` (no se suben).
- Tarda unos 7 minutos (dos builds y una espera de 45 s por el refresco del panel).

## Errores conocidos

- El rate limit de pedidos vive en memoria: reiniciá el server entre corridas o los pedidos fallan con 429.
- Si una corrida ve datos de otra (por ejemplo `rev` mayor a 1 al empezar), quedó un `next-server` viejo escuchando en el puerto: `run.sh` corta si el puerto está ocupado.
- Si un test de pedido falla con 409 sin conflicto real, revisá el ETag débil (ver `backend-estado`).
