---
name: backend-estado
description: Cambios en datos, endpoints, sesión o persistencia: siempre en packages/state, auth o api, nunca en una app.
---

# backend-estado

> Borrador de Fase 0. Se completa en la Fase 2 con uso real.

## Cuándo usarla

Cualquier cambio en la forma de los datos, en endpoints, en el login o en la persistencia.

## Paquetes

`packages/state`, `packages/auth`, `packages/api`. El README de cada uno es el contrato.

## Pasos

1. Leé el README del paquete. Si el cambio rompe el contrato, es un cambio mayor: necesita nota de migración para cada app.
2. Cambiá el paquete con test primero (mock de `@vercel/blob`).
3. Si cambia la forma del estado, subí `version` y escribí la migración.
4. Actualizá el README y el CHANGELOG del paquete en el mismo cambio.
5. `npm run check` (todas las apps).

## Errores conocidos

- Blob: `accept-encoding: identity` al leer; `useCache: false` antes de escribir.
- Next 16: leé `node_modules/next/dist/docs/` antes de escribir route handlers.
