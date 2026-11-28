# @nexora/media

Fotos subidas desde el panel.

> Versión 0.1.0, extraída de Puerto Chill (Fase 1), con tests en `test/`. Este README es el contrato: si el código cambia, este archivo cambia en el mismo PR.

## Qué ofrece

- `createMediaHandlers({ isAdmin, maxBytes?, prefix? })` → `uploadPOST` (`/api/upload`), `imgGET` (`/api/img`).
- `IMG_PREFIX`, `IMG_PATH`, `ENV`.
- `@nexora/media/client`: `shrink(file, max?, quality?)`, `uploadImage(file)`.

## Qué garantiza

- Solo el panel sube. Las rutas servidas se validan contra `<entorno>/img/`.

## Se extrae de

Titán `api/upload.js`, `api/img.js` · Puerto Chill `src/app/api/upload/route.ts`, `src/app/api/img/route.ts`, `src/lib/admin-client.ts`

## Errores conocidos

- Achicar en el navegador antes de subir: las funciones de Vercel tienen límite de tamaño de body.
