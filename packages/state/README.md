# @nexora/state

Estado del sitio en Vercel Blob privado: un JSON por entorno con revisión y escritura condicional.

> Estado: **contrato en borrador** (Fase 0). El código se extrae en la Fase 1. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `readState(fresh)` → `{ rev, data, etag }`. `fresh = true` lee sin caché.
- `writeState(cur, data)` → nueva `rev`. Lanza `ConflictError` si otro escribió entre medio.
- `mutateState(fn, tries = 3)`: lee fresco, aplica `fn`, guarda; ante conflicto relee y reintenta.
- `publicView(data, privateKeys)`: quita las claves privadas declaradas en `site.config.ts`.
- Handlers listos: `GET /api/state` (público, sanitizado), `GET/PUT /api/admin/state` (panel, con `baseRev` → 409 `{ rev, data }`).
- Adaptador local (`localStorage`) para correr sin Blob en desarrollo.

## Qué garantiza

- Producción, preview y desarrollo nunca comparten datos (`<VERCEL_ENV>/state.json`).
- Ninguna escritura pisa otra: toda escritura lleva `ifMatch`.
- La respuesta pública nunca incluye claves privadas.

## Se extrae de

Titán `api/_lib.js` (readState, writeState, mutateState, publicView) · Puerto Chill `src/lib/server/state.ts`, `src/app/api/state/route.ts`, `src/app/api/admin/state/route.ts`

## Errores conocidos

- Leer con `accept-encoding: identity`: con gzip el ETag llega débil y `ifMatch` falla siempre.
- Leer con `useCache: false` antes de escribir (la caché de Blob demora hasta ~60 s).
