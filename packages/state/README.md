# @nexora/state

Estado del sitio en Vercel Blob privado: un JSON por entorno con revisión y escritura condicional.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `createBlobState<T>({ path? })` → `readState(fresh)`, `writeState(cur, data)`, `mutateState(fn, tries?)`. Path por defecto `<VERCEL_ENV>/state.json`.
- `ConflictError`, `ENV`, `omitKeys(data, keys)`.
- `createStateHandlers({ state, isAdmin, publicView, validate, maxBytes? })` → `publicGET`, `adminGET`, `adminPUT`.
- `createInitialLoader({ state, publicView })` → `initialFor("public" | "admin")` (null sin `BLOB_READ_WRITE_TOKEN`: modo local).

## Qué garantiza

- Producción, preview y desarrollo nunca comparten datos (`<VERCEL_ENV>/state.json`).
- Ninguna escritura pisa otra: toda escritura lleva `ifMatch`.
- La respuesta pública nunca incluye claves privadas.

## Se extrae de

Titán `api/_lib.js` (readState, writeState, mutateState, publicView) · Puerto Chill `src/lib/server/state.ts`, `src/app/api/state/route.ts`, `src/app/api/admin/state/route.ts`

## Errores conocidos

- Leer con `accept-encoding: identity`: con gzip el ETag llega débil y `ifMatch` falla siempre.
- Leer con `useCache: false` antes de escribir (la caché de Blob demora hasta ~60 s).
